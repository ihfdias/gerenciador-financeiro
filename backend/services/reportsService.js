const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { buildDateRange, buildMonthRange, parsePositiveInteger } = require('../utils/validation');

function resolveRangeFromQuery(query) {
  const year = parsePositiveInteger(query.year);
  const month = parsePositiveInteger(query.month);
  const { startDate: startDateParam, endDate: endDateParam } = query;

  if ((startDateParam && !endDateParam) || (!startDateParam && endDateParam)) {
    return { error: 'Informe a data inicial e final para filtrar por intervalo.' };
  }

  if (query.month && (!month || month > 12)) {
    return { error: 'Mês inválido.' };
  }

  if (startDateParam && endDateParam) {
    const range = buildDateRange(startDateParam, endDateParam);

    if (!range) {
      return { error: 'Intervalo de datas inválido.' };
    }

    return { range };
  }

  if (!year || !month) {
    return { error: 'Ano e mês são obrigatórios.' };
  }

  return { range: buildMonthRange(year, month) };
}

async function getSummaryByCategory(userId, query) {
  const resolved = resolveRangeFromQuery(query);
  if (resolved.error) {
    return { error: resolved.error };
  }

  const { startDate, endDate } = resolved.range;

  const summary = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lt: endDate },
        type: 'expense',
      },
    },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $project: { _id: 0, name: '$_id', value: { $abs: '$total' } } },
    { $sort: { value: -1 } },
  ]);

  return { data: summary };
}

async function getForecast(userId) {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));

  const [currentMonthTransactions, historicalMonths] = await Promise.all([
    Transaction.find({ user: userId, date: { $gte: monthStart, $lt: monthEnd } }).lean(),
    Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $lt: monthStart },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, { $abs: '$amount' }, 0] } },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]),
  ]);

  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  const elapsedDays = Math.max(1, now.getUTCDate());
  const incomeToDate = currentMonthTransactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);
  const expenseToDateAbs = currentMonthTransactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);
  const currentBalanceToDate = incomeToDate - expenseToDateAbs;

  const historicalAvgIncome = historicalMonths.length
    ? historicalMonths.reduce((sum, item) => sum + item.income, 0) / historicalMonths.length
    : incomeToDate;
  const historicalAvgExpense = historicalMonths.length
    ? historicalMonths.reduce((sum, item) => sum + item.expense, 0) / historicalMonths.length
    : expenseToDateAbs;

  const projectedIncome = Math.max(incomeToDate, (incomeToDate / elapsedDays) * daysInMonth, historicalAvgIncome);
  const projectedExpense = Math.max(expenseToDateAbs, (expenseToDateAbs / elapsedDays) * daysInMonth, historicalAvgExpense);

  return {
    period: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`,
    inputs: {
      elapsedDays,
      daysInMonth,
      currentBalanceToDate,
      incomeToDate,
      expenseToDate: expenseToDateAbs,
    },
    projection: {
      projectedIncome,
      projectedExpense,
      projectedEndBalance: projectedIncome - projectedExpense,
    },
    historicalBaseline: {
      monthsUsed: historicalMonths.length,
      averageIncome: historicalAvgIncome,
      averageExpense: historicalAvgExpense,
    },
  };
}

async function getBalanceTrend(userId, monthsInput) {
  const months = Math.min(parsePositiveInteger(monthsInput) || 6, 24);
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));

  const grouped = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        monthNet: { $sum: '$amount' },
        income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
        expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, { $abs: '$amount' }, 0] } },
      },
    },
  ]);

  const groupedMap = new Map(grouped.map((item) => [`${item._id.year}-${item._id.month}`, item]));

  const timeline = [];
  let accumulatedBalance = 0;

  for (let i = 0; i < months; i += 1) {
    const refDate = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1, 0, 0, 0, 0));
    const key = `${refDate.getUTCFullYear()}-${refDate.getUTCMonth() + 1}`;
    const found = groupedMap.get(key);
    const monthNet = found?.monthNet || 0;

    accumulatedBalance += monthNet;

    timeline.push({
      monthKey: `${refDate.getUTCFullYear()}-${String(refDate.getUTCMonth() + 1).padStart(2, '0')}`,
      label: refDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
      income: found?.income || 0,
      expense: found?.expense || 0,
      monthNet,
      accumulatedBalance,
    });
  }

  return { months, timeline };
}

module.exports = {
  getBalanceTrend,
  getForecast,
  getSummaryByCategory,
};
