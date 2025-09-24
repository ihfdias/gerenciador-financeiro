const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');


router.get('/', auth, async (req, res) => {
  try {
    const query = { user: req.user.id };
    const { year, month } = req.query;

    if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 1);
      query.date = { $gte: startDate, $lt: endDate }; 
    }
    const transactions = await Transaction.find(query).sort({ date: -1 }); 
    res.json(transactions);
  } catch (err) {
    res.status(500).send('Erro no servidor.');
  }
});


router.post('/', auth, async (req, res) => {
  const { description, amount, type, category, date } = req.body;
  if (!description || !amount || !type || !category || !date) {
    return res.status(400).json({ msg: 'Por favor, inclua todos os campos.' });
  }
  try {
    const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    const newTransaction = new Transaction({
      description,
      amount: finalAmount,
      type,
      category,
      date, 
      user: req.user.id
    });
    const transaction = await newTransaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).send('Erro no servidor.');
  }
});


router.put('/:id', auth, async (req, res) => {
  const { description, amount, type, category, date } = req.body;
  const updatedFields = {};
  if (description) updatedFields.description = description;
  if (amount) updatedFields.amount = amount;
  if (type) updatedFields.type = type;
  if (category) updatedFields.category = category;
  if (date) updatedFields.date = date; 

  if (type && amount) {
    updatedFields.amount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
  }

  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: 'Transação não encontrada.' });
    if (transaction.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Não autorizado.' });
    
    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );
    res.json(transaction);
  } catch (err) {
    res.status(500).send('Erro no servidor.');
  }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ msg: 'Transação não encontrada.' });
        if (transaction.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Não autorizado.' });
        
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Transação removida.' });
    } catch (err) {
        res.status(500).send('Erro no servidor.');
    }
});

module.exports = router;