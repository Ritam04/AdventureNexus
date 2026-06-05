import { NextFunction, Response } from 'express';
import Plan from '../../../shared/database/models/planModel';
import createError from 'http-errors';
import logger from '../../../shared/utils/logger';

/**
 * Controller to delete an activity (itinerary item) from a travel plan.
 */
export const deleteActivity = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id, activityId } = req.params;

        const plan = await Plan.findById(id);
        if (!plan) {
            return next(createError(404, 'Plan not found'));
        }

        // Authorization check: only the owner can modify this plan
        if (plan.userId.toString() !== req.user._id.toString()) {
            return next(createError(403, 'You do not have permission to modify this plan'));
        }

        if (!plan.itineraryItems) {
            return next(createError(404, 'No itinerary items found for this plan'));
        }

        const initialLength = plan.itineraryItems.length;
        plan.itineraryItems = plan.itineraryItems.filter((item: any) => item.id !== activityId);

        if (plan.itineraryItems.length === initialLength) {
            return next(createError(404, 'Activity not found'));
        }

        await plan.save();

        return res.status(200).json({
            status: 'Success',
            message: 'Activity deleted successfully.',
            data: plan.itineraryItems
        });
    } catch (error) {
        logger.error('Error in deleteActivityController:', error);
        return next(createError(500, 'Internal Server Error'));
    }
};
