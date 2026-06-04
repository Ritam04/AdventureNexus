import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { processUserMessage, getHistoryMessages, clearChatHistory } from './chatService';
import Plan from '../../shared/database/models/planModel';
import User from '../../shared/database/models/userModel';
import logger from '../../shared/utils/logger';

/**
 * Send message to AI travel assistant.
 */
export const sendChatMessage = async (req: any, res: Response, next: NextFunction) => {
    try {
        const firebaseUid = req.user?.firebaseUid;
        const { message } = req.body;

        if (!firebaseUid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Unauthorized: User is not authenticated.'
            });
        }

        if (!message || message.trim() === '') {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Bad Request: Message cannot be empty.'
            });
        }

        const data = await processUserMessage(firebaseUid, message);
        return res.status(StatusCodes.OK).json(data);
    } catch (error) {
        next(error);
    }
};

/**
 * Fetch chat history for the user.
 */
export const getChatHistory = async (req: any, res: Response, next: NextFunction) => {
    try {
        const firebaseUid = req.user?.firebaseUid;
        if (!firebaseUid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Unauthorized: User is not authenticated.'
            });
        }

        const messages = await getHistoryMessages(firebaseUid);
        return res.status(StatusCodes.OK).json({
            success: true,
            data: messages
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Clear chat history.
 */
export const clearUserChatHistory = async (req: any, res: Response, next: NextFunction) => {
    try {
        const firebaseUid = req.user?.firebaseUid;
        if (!firebaseUid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Unauthorized: User is not authenticated.'
            });
        }

        const result = await clearChatHistory(firebaseUid);
        return res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Convert chat response itinerary into a saved Plan document.
 */
export const convertChatToPlan = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        const firebaseUid = req.user?.firebaseUid;

        if (!userId || !firebaseUid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Unauthorized: User is not authenticated.'
            });
        }

        const {
            to,
            budget,
            days,
            itinerary,
            hotels
        } = req.body;

        if (!to) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Bad Request: Destination (to) is required.'
            });
        }

        // Format Itinerary to match suggested_itinerary schema in Plan model
        const formattedItinerary = (itinerary || []).map((item: any, idx: number) => ({
            day: item.day || idx + 1,
            title: item.title || `Day ${item.day || idx + 1}`,
            description: item.description || '',
            morning: item.activities?.[0] || 'Explore the city',
            afternoon: item.activities?.[1] || 'Local lunch & sightseeing',
            evening: item.activities?.[2] || 'Relaxing evening walk',
            activities: (item.activities || []).map((act: string) => ({
                name: act,
                cost: 'Included',
                time: 'Flexible',
                description: act
            }))
        }));

        // Construct Plan
        const newPlan = new Plan({
            userId,
            firebaseUid,
            to,
            from: 'Your Location',
            date: new Date(),
            budget: budget || 50000,
            travelers: 1,
            name: `AI Chat Trip to ${to}`,
            days: days || formattedItinerary.length || 3,
            suggested_itinerary: formattedItinerary,
            budget_breakdown: {
                flights: Math.round((budget || 50000) * 0.4),
                accommodation: Math.round((budget || 50000) * 0.3),
                activities: Math.round((budget || 50000) * 0.15),
                food: Math.round((budget || 50000) * 0.15),
                total: budget || 50000
            },
            destination_overview: `AI generated plan matching your profile preferences for ${to}.`,
            travel_style: 'AI Custom',
            budget_range: 'Medium',
            hotels: hotels || []
        });

        await newPlan.save();

        // Link plan to User
        await User.findByIdAndUpdate(userId, {
            $push: { plans: newPlan._id }
        });

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Trip plan created successfully from AI Chat!',
            data: newPlan
        });

    } catch (error) {
        logger.error(`[AIChat] Convert Chat to Plan failed:`, error);
        next(error);
    }
};
