import { Request, Response } from 'express';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import GroupExpense from '../../../shared/database/models/groupExpenseModel';
import ExpenseItem from '../../../shared/database/models/expenseItemModel';
import UserBalance from '../../../shared/database/models/userBalanceModel';
import Group from '../../../shared/database/models/groupModel';
import {
    recalculateGroupBalances,
    calculateSettlements,
    getAIExpenseInsights
} from '../../../shared/services/expenseEngine';
import redis from '../../../shared/redis/client';
import { getIO } from '../../../shared/socket/socket';
import logger from '../../../shared/utils/logger';
import mongoose from 'mongoose';

/**
 * Helper to invalidate group expense cache
 */
const invalidateGroupExpenseCache = async (groupId: string) => {
    if (redis.status === 'ready') {
        const cacheKey = `expense:summary:${groupId}`;
        await redis.del(cacheKey);
        logger.info(`[Expense Cache] Invalidated summary cache for group: ${groupId}`);
    }
};

/**
 * Add a new expense item to a group
 */
export const addExpense = async (req: Request, res: Response) => {
    try {
        const {
            groupId,
            paidBy,
            amount,
            description,
            splitType,
            participants,
            splitDetails: inputSplitDetails
        } = req.body;

        const authUserId = (req as any).user?._id;

        // 1. Basic validation
        if (!groupId || !paidBy || !amount || !description || !splitType || !participants || !participants.length) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: 'Failed',
                message: 'Missing required fields: groupId, paidBy, amount, description, splitType, participants'
            });
        }

        // 2. Validate group membership
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: 'Failed',
                message: 'Group not found'
            });
        }

        const isMember = group.members.some(mId => mId.toString() === authUserId);
        if (!isMember) {
            return res.status(StatusCodes.FORBIDDEN).json({
                status: 'Failed',
                message: 'Access denied. You are not a member of this travel group.'
            });
        }

        // 3. Process splits
        let finalSplitDetails = [];
        if (splitType === 'equal') {
            const participantCount = participants.length;
            const equalAmount = parseFloat((amount / participantCount).toFixed(2));
            
            // Handle precision residue to ensure total equals exact amount
            const residue = parseFloat((amount - (equalAmount * participantCount)).toFixed(2));

            finalSplitDetails = participants.map((pId: string, idx: number) => {
                const isLast = idx === participantCount - 1;
                return {
                    userId: new mongoose.Types.ObjectId(pId),
                    amount: isLast ? parseFloat((equalAmount + residue).toFixed(2)) : equalAmount
                };
            });
        } else if (splitType === 'custom') {
            if (!inputSplitDetails || !Array.isArray(inputSplitDetails) || inputSplitDetails.length === 0) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    status: 'Failed',
                    message: 'Split details are required for custom split type.'
                });
            }

            // Verify split details match total amount
            const sumOfSplits = inputSplitDetails.reduce((sum, item) => sum + (item.amount || 0), 0);
            if (Math.abs(sumOfSplits - amount) > 0.02) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    status: 'Failed',
                    message: `Sum of custom splits (${sumOfSplits}) must equal the total amount (${amount}).`
                });
            }

            finalSplitDetails = inputSplitDetails.map(item => ({
                userId: new mongoose.Types.ObjectId(item.userId),
                amount: parseFloat(Number(item.amount).toFixed(2))
            }));
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: 'Failed',
                message: 'Invalid splitType. Must be either "equal" or "custom".'
            });
        }

        // 4. Fetch or create GroupExpense container
        let groupExpense = await GroupExpense.findOne({ groupId });
        if (!groupExpense) {
            groupExpense = new GroupExpense({
                groupId: new mongoose.Types.ObjectId(groupId),
                title: `${group.name} Trip Expenses`,
                createdBy: new mongoose.Types.ObjectId(authUserId),
                totalAmount: 0,
                participants: []
            });
        }

        // Create the ExpenseItem
        const expenseItem = new ExpenseItem({
            expenseId: groupExpense._id,
            paidBy: new mongoose.Types.ObjectId(paidBy),
            amount: parseFloat(Number(amount).toFixed(2)),
            description,
            splitType,
            splitDetails: finalSplitDetails
        });

        await expenseItem.save();

        // Update GroupExpense container metadata
        groupExpense.totalAmount = parseFloat((groupExpense.totalAmount + amount).toFixed(2));
        
        // Add new participants to the set
        const currentParticipants = groupExpense.participants.map(p => p.toString());
        participants.forEach((pId: string) => {
            if (!currentParticipants.includes(pId)) {
                groupExpense?.participants.push(new mongoose.Types.ObjectId(pId));
            }
        });

        await groupExpense.save();

        // 5. Trigger recalculations (Debt engine)
        const updatedBalances = await recalculateGroupBalances(groupId);
        const settlements = await calculateSettlements(groupId);

        // Invalidate Redis cache
        await invalidateGroupExpenseCache(groupId);

        // Populate paidBy on response for neat UI
        const populatedExpense = await ExpenseItem.findById(expenseItem._id)
            .populate('paidBy', 'username fullname profilepicture')
            .populate('splitDetails.userId', 'username fullname profilepicture');

        // 6. Broadcast socket events
        try {
            const io = getIO();
            if (io) {
                io.to(`group:${groupId}`).emit('expense:added', populatedExpense);
                io.to(`group:${groupId}`).emit('balance:updated', {
                    balances: updatedBalances,
                    settlements
                });
            }
        } catch (socketError) {
            logger.warn('Socket broadcast skipped. Client might not be connected yet.');
        }

        return res.status(StatusCodes.CREATED).json({
            status: 'Success',
            message: 'Expense item added and group balances recalculated.',
            data: {
                expenseItem: populatedExpense,
                balances: updatedBalances,
                settlements
            }
        });

    } catch (error) {
        logger.error('[addExpense Error]:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'Failed',
            message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
            error
        });
    }
};

/**
 * Fetch all expense items for a group
 */
export const getGroupExpenses = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const authUserId = (req as any).user?._id;

        // Verify membership
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: 'Failed',
                message: 'Group not found'
            });
        }

        const isMember = group.members.some(mId => mId.toString() === authUserId);
        if (!isMember) {
            return res.status(StatusCodes.FORBIDDEN).json({
                status: 'Failed',
                message: 'Access denied. You are not a member of this travel group.'
            });
        }

        const groupExpense = await GroupExpense.findOne({ groupId });
        if (!groupExpense) {
            return res.status(StatusCodes.OK).json({
                status: 'Success',
                data: []
            });
        }

        const items = await ExpenseItem.find({ expenseId: groupExpense._id })
            .populate('paidBy', 'username fullname profilepicture')
            .populate('splitDetails.userId', 'username fullname profilepicture')
            .sort({ createdAt: -1 });

        return res.status(StatusCodes.OK).json({
            status: 'Success',
            data: items
        });
    } catch (error) {
        logger.error('[getGroupExpenses Error]:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'Failed',
            message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
        });
    }
};

/**
 * Fetch financial summary (balances, settlements, insights, totals) with caching support
 */
export const getExpenseSummary = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const authUserId = (req as any).user?._id;

        // Verify membership
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: 'Failed',
                message: 'Group not found'
            });
        }

        const isMember = group.members.some(mId => mId.toString() === authUserId);
        if (!isMember) {
            return res.status(StatusCodes.FORBIDDEN).json({
                status: 'Failed',
                message: 'Access denied. You are not a member of this travel group.'
            });
        }

        // 1. Try Redis cache hit
        const cacheKey = `expense:summary:${groupId}`;
        if (redis.status === 'ready') {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                logger.info(`[Expense Cache] Summary cache hit for group: ${groupId}`);
                return res.status(StatusCodes.OK).json({
                    status: 'Success',
                    data: JSON.parse(cachedData)
                });
            }
        }

        // 2. Cache miss -> calculate on demand
        const groupExpense = await GroupExpense.findOne({ groupId });
        const totalGroupSpend = groupExpense ? groupExpense.totalAmount : 0;

        // Ensure balances exist in DB
        const balances = await recalculateGroupBalances(groupId);
        const settlements = await calculateSettlements(groupId);

        // Fetch items for spending insights
        const expenseIds = groupExpense ? [groupExpense._id] : [];
        const expenseItems = await ExpenseItem.find({ expenseId: { $in: expenseIds } }).populate('paidBy', 'fullname username');

        const aiInsights = getAIExpenseInsights(expenseItems, balances);

        const summary = {
            totalGroupSpend,
            balances,
            settlements,
            aiInsights
        };

        // 3. Cache the calculated summary for 5 minutes
        if (redis.status === 'ready') {
            await redis.setex(cacheKey, 300, JSON.stringify(summary));
            logger.info(`[Expense Cache] Created new summary cache for group: ${groupId}`);
        }

        return res.status(StatusCodes.OK).json({
            status: 'Success',
            data: summary
        });
    } catch (error) {
        logger.error('[getExpenseSummary Error]:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'Failed',
            message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
        });
    }
};
