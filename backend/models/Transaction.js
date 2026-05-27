const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdraw'],
    required: [true, 'Transaction type (deposit/withdraw) is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than zero'],
  },
  category: {
    type: String,
    enum: ['salary', 'food', 'utilities', 'entertainment', 'shopping', 'transfer', 'other'],
    default: 'other',
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
