const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const Transaction = require('../models/Transaction');
const {
  isValidObjectId,
  parseDate,
  parseMoney,
  parsePositiveInteger,
  sanitizeString,
} = require('../utils/validation');

function normalizeTransactionPayload(input, { partial = false } = {}) {
  input = input || {};
  const payload = {};
  const errors = [];

  if (!partial || input.description !== undefined) {
    const description = sanitizeString(input.description);
    if (!description || description.length < 2 || description.length > 120) {
      errors.push('Descrição inválida.');
    } else {
      payload.description = description;
    }
  }

  if (!partial || input.category !== undefined) {
    const category = sanitizeString(input.category);
    if (!category || category.length < 2 || category.length > 60) {
      errors.push('Categoria inválida.');
    } else {
      payload.category = category;
    }
  }

  if (!partial || input.type !== undefined) {
    if (!['income', 'expense'].includes(input.type)) {
      errors.push('Tipo de transação inválido.');
    } else {
      payload.type = input.type;
    }
  }

  if (!partial || input.amount !== undefined) {
    const amount = parseMoney(input.amount);
    if (amount === null || amount <= 0) {
      errors.push('Valor inválido.');
    } else {
      payload.amount = Math.abs(amount);
    }
  }

  if (!partial || input.date !== undefined) {
    const date = parseDate(input.date);
    if (!date) {
      errors.push('Data inválida.');
    } else {
      payload.date = date;
    }
  }

  return { payload, errors };
}

router.get('/', auth, async (req, res) => {
  try {
    const query = { user: req.user.id };
    const year = parsePositiveInteger(req.query.year);
    const month = parsePositiveInteger(req.query.month);

    if ((req.query.year && !year) || (req.query.month && (!month || month > 12))) {
      return res.status(400).json({ msg: 'Filtro de data inválido.' });
    }

    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      query.date = { $gte: startDate, $lt: endDate }; 
    }

    const transactions = await Transaction.find(query).sort({ date: -1 }); 
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ msg: 'Erro no servidor.' });
  }
});


router.post('/', auth, csrfProtection, async (req, res) => {
  const { payload, errors } = normalizeTransactionPayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ msg: errors[0] });
  }

  try {
    const finalAmount = payload.type === 'expense' ? -payload.amount : payload.amount;
    const newTransaction = new Transaction({
      description: payload.description,
      amount: finalAmount,
      type: payload.type,
      category: payload.category,
      date: payload.date,
      user: req.user.id
    });
    const transaction = await newTransaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ msg: 'Erro no servidor.' });
  }
});


router.put('/:id', auth, csrfProtection, async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ msg: 'ID de transação inválido.' });
  }

  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: 'Transação não encontrada.' });
    if (transaction.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Não autorizado.' });

    const { payload, errors } = normalizeTransactionPayload(req.body, { partial: true });
    if (errors.length > 0) {
      return res.status(400).json({ msg: errors[0] });
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ msg: 'Nenhum campo válido foi enviado para atualização.' });
    }

    const nextType = payload.type || transaction.type;
    const baseAmount = payload.amount !== undefined ? payload.amount : Math.abs(transaction.amount);
    if (payload.amount !== undefined || payload.type !== undefined) {
      payload.amount = nextType === 'expense' ? -Math.abs(baseAmount) : Math.abs(baseAmount);
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, { $set: payload }, {
      new: true,
      runValidators: true,
    });

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ msg: 'Erro no servidor.' });
  }
});

router.delete('/:id', auth, csrfProtection, async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ msg: 'ID de transação inválido.' });
    }

    try {
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ msg: 'Transação não encontrada.' });
        if (transaction.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Não autorizado.' });
        
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Transação removida.' });
    } catch (err) {
        res.status(500).json({ msg: 'Erro no servidor.' });
    }
});

module.exports = router;
