import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || '';

export const expenseService = {
    // Add a new group expense item
    addExpense: async (expenseData, token) => {
        const res = await axios.post(`${API_URL}/api/v1/expenses/add`, expenseData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // Fetch all expense items for a specific group
    getGroupExpenses: async (groupId, token) => {
        const res = await axios.get(`${API_URL}/api/v1/expenses/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // Fetch financial summary and settlements
    getExpenseSummary: async (groupId, token) => {
        const res = await axios.get(`${API_URL}/api/v1/expenses/summary/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    }
};
