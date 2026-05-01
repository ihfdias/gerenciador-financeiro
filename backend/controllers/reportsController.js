const { getFinancialIndicators } = require('../services/indicatorsService');
const reportsService = require('../services/reportsService');

async function summaryByCategory(req, res) {
  try {
    const result = await reportsService.getSummaryByCategory(req.user.id, req.query);
    if (result.error) {
      return res.status(400).json({ msg: result.error });
    }

    return res.json(result.data);
  } catch (error) {
    return res.status(500).json({ msg: 'Erro no servidor.' });
  }
}

async function financialIndicators(req, res) {
  try {
    const indicators = await getFinancialIndicators({ forceRefresh: req.query.refresh === '1' });
    return res.json(indicators);
  } catch (error) {
    return res.status(502).json({ msg: 'Não foi possível obter os indicadores externos no momento.' });
  }
}

async function forecast(req, res) {
  try {
    const data = await reportsService.getForecast(req.user.id);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ msg: 'Erro ao calcular projeção de saldo.' });
  }
}

async function balanceTrend(req, res) {
  try {
    const data = await reportsService.getBalanceTrend(req.user.id, req.query.months);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ msg: 'Erro ao buscar tendência de saldo.' });
  }
}

module.exports = {
  balanceTrend,
  financialIndicators,
  forecast,
  summaryByCategory,
};
