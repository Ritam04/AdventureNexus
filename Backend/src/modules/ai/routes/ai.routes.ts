import express from 'express';
import protect from '../../../shared/middleware/firebaseAuthMiddleware';
import { getSuggestions, getTwinProfile } from '../controllers/suggestions.controller';
import {
    sendChatMessage,
    getChatHistory,
    clearUserChatHistory,
    convertChatToPlan
} from '../../aiChat/chatController';

const route = express.Router();

/**
 * @route GET /api/v1/ai/suggestions
 * @desc Get travel twins' smart AI plan recommendations.
 */
route.get('/suggestions', protect, getSuggestions);

/**
 * @route GET /api/v1/ai/profile
 * @desc Get travel twin preference profile insights.
 */
route.get('/profile', protect, getTwinProfile);

/**
 * @route POST /api/v1/ai/chat
 * @desc Send message to context-aware AI travel assistant.
 */
route.post('/chat', protect, sendChatMessage);

/**
 * @route GET /api/v1/ai/chat/history
 * @desc Retrieve user's travel chat conversation history.
 */
route.get('/chat/history', protect, getChatHistory);

/**
 * @route DELETE /api/v1/ai/chat/history
 * @desc Clear user's travel chat history.
 */
route.delete('/chat/history', protect, clearUserChatHistory);

/**
 * @route POST /api/v1/ai/convert-plan
 * @desc Convert a structured AI chat response into a saved travel plan.
 */
route.post('/convert-plan', protect, convertChatToPlan);

export default route;
