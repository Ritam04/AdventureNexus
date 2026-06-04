import express from 'express';
import {
    addExpense,
    getGroupExpenses,
    getExpenseSummary,
    sendExpenseReportEmail
} from '../controllers/expenseController';
import protect from '../../../shared/middleware/firebaseAuthMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/v1/expenses/add
router.post('/add', addExpense);

// GET /api/v1/expenses/:groupId
router.get('/:groupId', getGroupExpenses);

// GET /api/v1/expenses/summary/:groupId
router.get('/summary/:groupId', getExpenseSummary);

// POST /api/v1/expenses/summary/:groupId/send-email
router.post('/summary/:groupId/send-email', sendExpenseReportEmail);

export default router;
