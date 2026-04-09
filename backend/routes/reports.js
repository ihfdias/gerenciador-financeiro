const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const { buildDateRange, buildMonthRange, parsePositiveInteger } = require('../utils/validation');

router.get('/summary-by-category', auth, async (req, res) => {
  const year = parsePositiveInteger(req.query.year);
  const month = parsePositiveInteger(req.query.month);
  const { startDate: startDateParam, endDate: endDateParam } = req.query;

  if ((startDateParam && !endDateParam) || (!startDateParam && endDateParam)) {
    return res.status(400).json({ msg: 'Informe a data inicial e final para filtrar por intervalo.' });
  }

  if (req.query.month && (!month || month > 12)) {
    return res.status(400).json({ msg: 'Mês inválido.' });
  }

  let range = null;

  if (startDateParam && endDateParam) {
    range = buildDateRange(startDateParam, endDateParam);

    if (!range) {
      return res.status(400).json({ msg: 'Intervalo de datas inválido.' });
    }
  } else {
    if (!year || !month) {
      return res.status(400).json({ msg: 'Ano e mês são obrigatórios.' });
    }

    range = buildMonthRange(year, month);
  }

  const { startDate, endDate } = range;

  try {
    const summary = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startDate, $lt: endDate },
          type: 'expense'
        }
      },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $project: { _id: 0, name: '$_id', value: { $abs: '$total' } } }
    ]);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ msg: 'Erro no servidor.' });
  }
});

module.exports = router;
