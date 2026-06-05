import { NextFunction, Response } from 'express';
import Plan from '../../../shared/database/models/planModel';
import createError from 'http-errors';
import logger from '../../../shared/utils/logger';

/**
 * Controller to add a new activity (itinerary item) to a travel plan.
 */
export const addActivity = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { day, time, type, title, description, location, duration, cost, status } = req.body;

        const plan = await Plan.findById(id);
        if (!plan) {
            return next(createError(404, 'Plan not found'));
        }

        // Authorization check: only the owner can modify this plan
        if (plan.userId.toString() !== req.user._id.toString()) {
            return next(createError(403, 'You do not have permission to modify this plan'));
        }

        const newActivity = {
            id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            day: Number(day) || 1,
            time: time || '00:00',
            type: type || 'activity',
            title: title || 'New Activity',
            description: description || '',
            location: location || '',
            duration: duration || '',
            cost: Number(cost) || 0,
            status: status || 'confirmed'
        };

        if (!plan.itineraryItems) {
            plan.itineraryItems = [];
        }

        plan.itineraryItems.push(newActivity);
        await plan.save();

        return res.status(200).json({
            status: 'Success',
            message: 'Activity added successfully.',
            data: plan.itineraryItems
        });
    } catch (error) {
        logger.error('Error in addActivityController:', error);
        return next(createError(500, 'Internal Server Error'));
    }
};
