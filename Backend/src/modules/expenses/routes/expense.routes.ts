import express from 'express';
import {
    addExpense,
    getGroupExpenses,
    getExpenseSummary,
    sendExpenseReportEmail,
    getUserExpenses,
    updateExpense,
    deleteExpense,
    getExpenseGraph
} from '../controllers/expenseController';
import protect from '../../../shared/middleware/firebaseAuthMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/v1/expenses/add
router.post('/add', addExpense);

// GET /api/v1/expenses/user
router.get('/user', getUserExpenses);

// GET /api/v1/expenses/graph/:groupId
router.get('/graph/:groupId', getExpenseGraph);

// GET /api/v1/expenses/group/:groupId
router.get('/group/:groupId', getGroupExpenses);

// GET /api/v1/expenses/:groupId
router.get('/:groupId', getGroupExpenses);

// GET /api/v1/expenses/summary/:groupId
router.get('/summary/:groupId', getExpenseSummary);

// POST /api/v1/expenses/summary/:groupId/send-email
router.post('/summary/:groupId/send-email', sendExpenseReportEmail);

// PUT /api/v1/expenses/:id
router.put('/:id', updateExpense);

// DELETE /api/v1/expenses/:id
router.delete('/:id', deleteExpense);

export default router;
