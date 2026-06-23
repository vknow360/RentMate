const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['Rent', 'Electricity', 'Water', 'Internet', 'Groceries', 'Other'], required: true },
  amount: { type: Number, required: true },
  description: String,
  splitBetween: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);
