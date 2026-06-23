const Expense = require('../models/Expense');
const User = require('../models/User');

exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      createdBy: req.user._id,
      paidBy: req.body.paidBy || req.user._id
    });
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error("[DEBUG] Error in expenseController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const { groupId } = req.query;
    if (!groupId) return res.status(400).json({ success: false, error: 'groupId is required' });

    const expenses = await Expense.find({ groupId })
      .populate('createdBy', 'name')
      .populate('paidBy', 'name')
      .populate('splitBetween', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    console.error("[DEBUG] Error in expenseController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBalances = async (req, res) => {
  try {
    const { groupId } = req.query;
    if (!groupId) return res.status(400).json({ success: false, error: 'groupId is required' });

    const expenses = await Expense.find({ groupId }).populate('splitBetween', 'name').populate('paidBy', 'name');
    
    // totalPaid - totalOwed
    const balances = {}; // { userId: { user: obj, balance: 0 } }

    expenses.forEach(exp => {
      const amountPerPerson = exp.amount / exp.splitBetween.length;
      
      // Add paid amount
      const paidById = exp.paidBy._id.toString();
      if (!balances[paidById]) balances[paidById] = { user: exp.paidBy, balance: 0 };
      balances[paidById].balance += exp.amount;

      // Subtract owed amount
      exp.splitBetween.forEach(user => {
        const userId = user._id.toString();
        if (!balances[userId]) balances[userId] = { user, balance: 0 };
        balances[userId].balance -= amountPerPerson;
      });
    });

    const results = Object.values(balances).map(b => ({
      user: b.user,
      balance: Math.round(b.balance * 100) / 100
    }));

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("[DEBUG] Error in expenseController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });

    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await expense.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error("[DEBUG] Error in expenseController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find distinct groupIds where user is in splitBetween or paidBy
    const groups = await Expense.distinct('groupId', {
      $or: [
        { splitBetween: userId },
        { paidBy: userId }
      ]
    });
    
    res.status(200).json({ success: true, data: groups });
  } catch (error) {
    console.error("[DEBUG] Error in expenseController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Also add a helper to search users by email to add them to a group
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json({ success: true, data: [] });
    
    const users = await User.find({ 
      email: { $regex: q, $options: 'i' },
      role: 'student'
    }).select('name email');
    
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("[DEBUG] Error in expenseController.js:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

