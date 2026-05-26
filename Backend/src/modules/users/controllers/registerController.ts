import { Request, Response } from 'express';
import User from '../../../shared/database/models/userModel';
import { StatusCodes } from 'http-status-codes';
import logger from '../../../shared/utils/logger';

export const registerUser = async (req: Request, res: Response) => {
    try {
        // Even though it is called 'firebaseUid' in the DB, it is actually the Firebase UID now.
        // We do this to ensure backward compatibility with the existing database.
        const { firebaseUid, email, username, profileImage } = req.body;

        if (!firebaseUid || !email) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'firebaseUid (uid) and email are required'
            });
        }

        // Check if user already exists
        let user = await User.findOne({ firebaseUid });
        
        if (user) {
            // Update existing user with latest Firebase data
            user.email = email;
            if (username && !user.username) user.username = username; // Only set if empty
            if (profileImage && !user.profileImage) user.profileImage = profileImage;
            await user.save();
        } else {
            // Create new user
            user = new User({
                firebaseUid,
                email,
                username: username || email.split('@')[0],
                profileImage: profileImage || '',
                role: 'user'
            });
            await user.save();
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'User registered/synced successfully',
            data: user
        });

    } catch (error: any) {
        logger.error('Error registering user:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};
