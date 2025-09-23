const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

router.get('/', auth, async (req, res) => {
  try {    
    const query = { user: req.user.id };

    const { year, month, day } = req.query;
    
    if (year && month) {      
      const startDate = new Date(year, month - 1, 1);
      
      let endDate;
      if (day) {
       
        endDate = new Date(year, month - 1, Number(day) + 1);
      } else {
        
        endDate = new Date(year, month, 1);
      }
            
      query.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});

router.post('/', auth, async (req, res) => {
  const { description, amount, type } = req.body;
  try {
    const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    const newTransaction = new Transaction({
      description,
      amount: finalAmount,
      type,
      user: req.user.id
    });
    const transaction = await newTransaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).send('Erro no servidor.');
  }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ msg: 'Transação não encontrada.' });
        }
                
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Não autorizado.' });
        }
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Transação removida.' });
    } catch (err) {
        res.status(500).send('Erro no servidor.');
    }
});

module.exports = router;