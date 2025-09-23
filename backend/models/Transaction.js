const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);