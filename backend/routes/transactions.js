const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const Transaction = require('../models/Transaction');
const {
  buildDateRange,
  buildMonthRange,
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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/', auth, async (req, res) => {
  try {
    const query = { user: req.user.id };
    const year = parsePositiveInteger(req.query.year);
    const month = parsePositiveInteger(req.query.month);
    const { startDate: startDateParam, endDate: endDateParam } = req.query;
    const search = sanitizeString(req.query.search);
    const type = sanitizeString(req.query.type);
    const category = sanitizeString(req.query.category);
    const sort = sanitizeString(req.query.sort);
    const page = parsePositiveInteger(req.query.page);
    const limit = parsePositiveInteger(req.query.limit);

    if ((req.query.year && !year) || (req.query.month && (!month || month > 12))) {
      return res.status(400).json({ msg: 'Filtro de data inválido.' });
    }

    if ((startDateParam && !endDateParam) || (!startDateParam && endDateParam)) {
      return res.status(400).json({ msg: 'Informe a data inicial e final para filtrar por intervalo.' });
    }

    if (startDateParam && endDateParam) {
      const range = buildDateRange(startDateParam, endDateParam);

      if (!range) {
        return res.status(400).json({ msg: 'Intervalo de datas inválido.' });
      }

      query.date = { $gte: range.startDate, $lt: range.endDate };
    } else if (year && month) {
      const { startDate, endDate } = buildMonthRange(year, month);
      query.date = { $gte: startDate, $lt: endDate };
    }

    if (search) {
      query.$or = [
        { description: { $regex: escapeRegex(search), $options: 'i' } },
        { category: { $regex: escapeRegex(search), $options: 'i' } },
      ];
    }

    if (type) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ msg: 'Tipo de transação inválido.' });
      }

      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    const sortMap = {
      date_desc: { date: -1, createdAt: -1 },
      date_asc: { date: 1, createdAt: 1 },
      amount_desc: { amount: -1, date: -1 },
      amount_asc: { amount: 1, date: -1 },
    };
    const sortQuery = sortMap[sort] || sortMap.date_desc;

    if ((req.query.page && !page) || (req.query.limit && (!limit || limit > 100))) {
      return res.status(400).json({ msg: 'Paginação inválida.' });
    }

    if (page || limit) {
      const currentPage = page || 1;
      const perPage = limit || 10;
      const skip = (currentPage - 1) * perPage;

      const [transactions, totalItems] = await Promise.all([
        Transaction.find(query).sort(sortQuery).skip(skip).limit(perPage),
        Transaction.countDocuments(query),
      ]);

      return res.json({
        items: transactions,
        pagination: {
          page: currentPage,
          limit: perPage,
          totalItems,
          totalPages: Math.max(1, Math.ceil(totalItems / perPage)),
          hasNextPage: skip + transactions.length < totalItems,
          hasPreviousPage: currentPage > 1,
        },
      });
    }

    const transactions = await Transaction.find(query).sort(sortQuery);
    return res.json(transactions);
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
