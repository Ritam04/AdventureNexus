import { NextFunction, Response } from 'express';
import Plan from '../../../shared/database/models/planModel';
import createError from 'http-errors';
import logger from '../../../shared/utils/logger';
import { deleteFromCloudinary } from '../../../shared/services/cloudinaryService';
import fs from 'fs';
import path from 'path';

/**
 * Controller to delete a travel document from a plan.
 */
export const deleteDocument = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id, documentId } = req.params;

        const plan = await Plan.findById(id);
        if (!plan) {
            return next(createError(404, 'Plan not found'));
        }

        // Authorization check: only the owner can modify this plan
        if (plan.userId.toString() !== req.user._id.toString()) {
            return next(createError(403, 'You do not have permission to modify this plan'));
        }

        if (!plan.documents) {
            return next(createError(404, 'No documents found for this plan'));
        }

        const docToDelete = plan.documents.find((doc: any) => doc.id === documentId);
        if (!docToDelete) {
            return next(createError(404, 'Document not found'));
        }

        // Clean up: try deleting from Cloudinary if it's a Cloudinary URL
        if (docToDelete.url.includes('cloudinary.com')) {
            await deleteFromCloudinary(docToDelete.url);
        } else if (docToDelete.url.startsWith('/data/uploads/')) {
            // Delete from local file storage
            const localPath = path.resolve(__dirname, '../../../../Public', docToDelete.url.replace(/^\//, ''));
            if (fs.existsSync(localPath)) {
                fs.unlinkSync(localPath);
            }
        }

        plan.documents = plan.documents.filter((doc: any) => doc.id !== documentId);
        await plan.save();

        return res.status(200).json({
            status: 'Success',
            message: 'Document deleted successfully.',
            data: plan.documents
        });
    } catch (error) {
        logger.error('Error in deleteDocumentController:', error);
        return next(createError(500, 'Internal Server Error'));
    }
};
