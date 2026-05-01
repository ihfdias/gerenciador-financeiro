const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reportsController = require('../controllers/reportsController');
const createRateLimiter = require('../middleware/rateLimit');

const indicatorsRefreshLimit = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 3,
  message: 'Muitas atualizações de indicadores. Tente novamente em um minuto.',
});

router.get('/summary-by-category', auth, reportsController.summaryByCategory);
router.get('/financial-indicators', auth, indicatorsRefreshLimit, reportsController.financialIndicators);
router.get('/forecast', auth, reportsController.forecast);
router.get('/balance-trend', auth, reportsController.balanceTrend);

module.exports = router;
