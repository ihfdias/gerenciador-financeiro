const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reportsController = require('../controllers/reportsController');
router.get('/summary-by-category', auth, reportsController.summaryByCategory);
router.get('/forecast', auth, reportsController.forecast);
router.get('/balance-trend', auth, reportsController.balanceTrend);

module.exports = router;
