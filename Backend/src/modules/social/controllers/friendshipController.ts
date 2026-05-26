import { Request, Response } from 'express';
import Friendship, { FriendshipStatus } from '../../../shared/database/models/friendshipModel';
import User from '../../../shared/database/models/userModel';
import Notification, { NotificationType } from '../../../shared/database/models/notificationModel';
import { broadcastRealtimeEvent } from '../../../shared/socket/socket';

/**
 * Send a friend request
 * POST /api/social/friend-request
 */
export const sendFriendRequest = async (req: Request, res: Response) => {
    try {
        const { recipientFirebaseUid } = req.body;
        const requesterClerkUserId = (req as any).user?.firebaseUid;

        if (!recipientFirebaseUid || requesterClerkUserId === recipientFirebaseUid) {
            return res.status(400).json({ success: false, message: 'Invalid recipient' });
        }

        // Check if already friends or request pending
        const existingFriendship = await Friendship.findOne({
            $or: [
                { requesterClerkUserId, recipientFirebaseUid },
                { requesterClerkUserId: recipientFirebaseUid, recipientFirebaseUid: requesterClerkUserId }
            ]
        });

        if (existingFriendship) {
            return res.status(400).json({ success: false, message: 'Friendship already exists or request pending' });
        }

        const friendship = new Friendship({
            requesterClerkUserId,
            recipientFirebaseUid,
            status: FriendshipStatus.PENDING
        });

        await friendship.save();

        // Create notification
        const notification = new Notification({
            recipientFirebaseUid: recipientFirebaseUid,
            senderFirebaseUid: requesterClerkUserId,
            type: NotificationType.FRIEND_REQUEST,
            relatedId: friendship._id
        });
        await notification.save();

        // Broadcast real-time notification
        broadcastRealtimeEvent(recipientFirebaseUid, 'notification:new', notification);

        return res.status(201).json({
            success: true,
            message: 'Friend request sent',
            data: friendship
        });
    } catch (error: any) {
        console.error('Error sending friend request:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Accept a friend request
 * POST /api/social/accept-request
 */
export const acceptFriendRequest = async (req: Request, res: Response) => {
    try {
        const { friendshipId } = req.body;
        const userFirebaseUid = (req as any).user?.firebaseUid;

        const friendship = await Friendship.findById(friendshipId);

        if (!friendship || friendship.recipientFirebaseUid !== userFirebaseUid) {
            return res.status(404).json({ success: false, message: 'Friend request not found' });
        }

        if (friendship.status !== FriendshipStatus.PENDING) {
            return res.status(400).json({ success: false, message: 'Request already processed' });
        }

        friendship.status = FriendshipStatus.ACCEPTED;
        await friendship.save();

        // Create notification for the requester
        const notification = new Notification({
            recipientFirebaseUid: friendship.requesterClerkUserId,
            senderFirebaseUid: userFirebaseUid,
            type: NotificationType.FRIEND_ACCEPTED,
            relatedId: friendship._id
        });
        await notification.save();

        broadcastRealtimeEvent(friendship.requesterClerkUserId, 'notification:new', notification);

        return res.status(200).json({
            success: true,
            message: 'Friend request accepted',
            data: friendship
        });
    } catch (error: any) {
        console.error('Error accepting friend request:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get friend list
 * GET /api/social/friends
 */
export const getFriends = async (req: Request, res: Response) => {
    try {
        const userFirebaseUid = (req as any).user?.firebaseUid;

        const friendships = await Friendship.find({
            $or: [{ requesterClerkUserId: userFirebaseUid }, { recipientFirebaseUid: userFirebaseUid }],
            status: FriendshipStatus.ACCEPTED
        });

        const friendIds = friendships.map(f => 
            f.requesterClerkUserId === userFirebaseUid ? f.recipientFirebaseUid : f.requesterClerkUserId
        );

        const friends = await User.find({ firebaseUid: { $in: friendIds } })
            .select('firebaseUid username fullname profilepicture onlineStatus lastActive');

        return res.status(200).json({
            success: true,
            data: friends
        });
    } catch (error: any) {
        console.error('Error fetching friends:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
