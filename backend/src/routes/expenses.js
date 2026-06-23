const express = require('express');
const { createExpense, getExpenses, getBalances, deleteExpense, getGroups, searchUsers } = require('../controllers/expenseController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorize('student'));

router.get('/groups', getGroups);
router.get('/balances', getBalances);
router.get('/users/search', searchUsers);
router.get('/', getExpenses);
router.post('/', createExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
