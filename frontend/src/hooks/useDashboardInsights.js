import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

export function useDashboardInsights() {
  const [financialIndicators, setFinancialIndicators] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [balanceTrend, setBalanceTrend] = useState([]);
  const [isInsightLoading, setIsInsightLoading] = useState(true);

  const refreshInsights = useCallback(async () => {
    setIsInsightLoading(true);
    try {
      const [indicatorsResponse, forecastResponse, trendResponse] = await Promise.all([
        api.get('/api/reports/financial-indicators'),
        api.get('/api/reports/forecast'),
        api.get('/api/reports/balance-trend?months=6'),
      ]);
      setFinancialIndicators(indicatorsResponse.data);
      setForecast(forecastResponse.data);
      setBalanceTrend(trendResponse.data?.timeline || []);
    } catch (error) {
      console.error('Erro ao carregar insights do dashboard:', error);
      setFinancialIndicators(null);
      setForecast(null);
      setBalanceTrend([]);
    } finally {
      setIsInsightLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshInsights();
  }, [refreshInsights]);

  return {
    balanceTrend,
    financialIndicators,
    forecast,
    isInsightLoading,
    refreshInsights,
  };
}
