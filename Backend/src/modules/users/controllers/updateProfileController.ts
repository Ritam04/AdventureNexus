import { NextFunction, Request, Response } from 'express';
import User from '../../../shared/database/models/userModel';
import createHttpError from 'http-errors';
import logger from '../../../shared/utils/logger';
import cloudinary from '../../../shared/services/cloudinaryService';
import fs from 'fs';

/**
 * Controller to update User Profile.
 * Updates MongoDB custom fields.
 */
export const updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const clerkUserId = req.user?.clerkUserId;
        if (!clerkUserId) {
            return next(createHttpError(401, 'Unauthorized'));
        }

        const {
            firstName,
            lastName,
            fullname,
            bio,
            coverImage,
            phonenumber,
            gender,
            country,
            preferences,
            isPrivate,
            username
        } = req.body;

        // 2. Update MongoDB
        const updateData: any = {};
        if (fullname !== undefined) updateData.fullname = fullname;
        if (bio !== undefined) updateData.bio = bio;
        if (coverImage !== undefined) updateData.coverImage = coverImage;
        if (phonenumber !== undefined) {
            updateData.phonenumber = phonenumber === '' ? null : Number(phonenumber);
        }
        if (gender !== undefined) updateData.gender = gender;
        if (country !== undefined) updateData.country = country;
        if (preferences !== undefined) updateData.preferences = preferences;
        if (isPrivate !== undefined) updateData.isPrivate = isPrivate === 'true' || isPrivate === true;

        // Also sync names if they changed
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (username !== undefined) updateData.username = username;

        // 3. Handle Image Upload to Cloudinary
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'adventurenexus/profiles',
                    width: 800,
                    crop: 'scale',
                });
                
                // If it's a cover image update
                if (req.body.imageType === 'cover') {
                    updateData.coverImage = result.secure_url;
                } else if (req.body.imageType === 'profile') {
                    updateData.profilepicture = result.secure_url;
                }

                // Delete the file from local storage after upload
                fs.unlinkSync(req.file.path);
                
                logger.info(`✅ Image uploaded to Cloudinary: ${result.secure_url}`);
            } catch (uploadError: any) {
                logger.error(`❌ Cloudinary upload failed: ${uploadError.message}`);
                // Ensure local file is deleted even if upload fails
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                return next(createHttpError(500, 'Image upload failed'));
            }
        }

        const updatedUser = await User.findOneAndUpdate(
            { clerkUserId },
            { $set: updateData },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });

    } catch (error: any) {
        logger.error('Error updating profile:', error);
        if (error.code === 11000 && error.keyPattern?.username) {
            return next(createHttpError(400, 'Username already exists. Please choose another one.'));
        }
        return next(createHttpError(500, 'Failed to update profile'));
    }
};
