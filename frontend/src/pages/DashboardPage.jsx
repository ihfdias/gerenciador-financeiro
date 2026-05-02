import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import EditModal from '../components/EditModal';
import ConfirmationModal from '../components/ConfirmationModal';
import HistoryFiltersPanel from '../components/HistoryFiltersPanel';
import PeriodNavigator from '../components/PeriodNavigator';
import PeriodLoadingCard from '../components/PeriodLoadingCard';
import InsightsPanel from '../components/InsightsPanel';
import TrendChartCard from '../components/TrendChartCard';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import {
  buildPeriodQuery,
  formatDateInput,
  getComparisonLabel,
  formatPeriodLabel,
  getMonthDateRange,
  getPreviousPeriodParams,
  getPresetDateRange,
  isRangeReady,
  isRangeValid,
} from '../utils/period';
const categories = ["Salário", "Comida", "Transporte", "Moradia", "Lazer", "Saúde", "Educação", "Investimentos", "Outros"];

function DashboardPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentMonthRange = getMonthDateRange(currentYear, currentMonth);
  const [transactions, setTransactions] = useState([]);
  const [previousTransactions, setPreviousTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPeriodLoading, setIsPeriodLoading] = useState(false);
  const navigate = useNavigate();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(formatDateInput(now));

  const [filterMode, setFilterMode] = useState('month');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [startDate, setStartDate] = useState(currentMonthRange.startDate);
  const [endDate, setEndDate] = useState(currentMonthRange.endDate);
  const [activePreset, setActivePreset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('all');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState('all');
  const [historySortOrder, setHistorySortOrder] = useState('date_desc');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 8,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [balanceTrend, setBalanceTrend] = useState([]);
  const [isInsightLoading, setIsInsightLoading] = useState(true);
  const [isPrivacyMode, setIsPrivacyMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem('financeflow:privacy-mode') === '1';
  });
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const { logout, user } = useAuth();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('financeflow:privacy-mode', isPrivacyMode ? '1' : '0');
    }
  }, [isPrivacyMode]);

  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const isRangeFilterReady = isRangeReady(startDate, endDate);
  const isRangeFilterValid = isRangeValid(startDate, endDate);
  const rangeError = filterMode === 'range' && isRangeFilterReady && !isRangeFilterValid
    ? 'A data inicial precisa ser anterior ou igual à data final.'
    : '';
  const periodQueryString = buildPeriodQuery({ filterMode, selectedYear, selectedMonth, startDate, endDate });
  const historyQueryParams = new URLSearchParams(periodQueryString);

  if (debouncedSearchTerm.trim()) {
    historyQueryParams.set('search', debouncedSearchTerm.trim());
  }

  if (historyTypeFilter !== 'all') {
    historyQueryParams.set('type', historyTypeFilter);
  }

  if (historyCategoryFilter !== 'all') {
    historyQueryParams.set('category', historyCategoryFilter);
  }

  historyQueryParams.set('sort', historySortOrder);
  historyQueryParams.set('page', String(historyPage));
  historyQueryParams.set('limit', String(historyPagination.limit));
  const historyQueryString = historyQueryParams.toString();
  const previousPeriodParams = getPreviousPeriodParams({ filterMode, selectedYear, selectedMonth, startDate, endDate });
  const previousQueryString = buildPeriodQuery({
    filterMode: previousPeriodParams.filterMode,
    selectedYear: previousPeriodParams.selectedYear,
    selectedMonth: previousPeriodParams.selectedMonth,
    startDate: previousPeriodParams.startDate,
    endDate: previousPeriodParams.endDate,
  });
  const previousPeriodLabel = getComparisonLabel(previousPeriodParams);

  const refreshTransactions = async () => {
    if (filterMode === 'range' && (!isRangeFilterReady || !isRangeFilterValid)) {
      setTransactions([]);
      setPreviousTransactions([]);
      setHistoryPagination((current) => ({
        ...current,
        page: 1,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }));
      return;
    }

    const [currentResponse, previousResponse] = await Promise.all([
      api.get(`/api/transactions?${historyQueryString}`),
      api.get(`/api/transactions?${previousQueryString}`),
    ]);
    setTransactions(currentResponse.data.items);
    setHistoryPagination(currentResponse.data.pagination);
    setPreviousTransactions(previousResponse.data);
  };

  const refreshInsights = async () => {
    setIsInsightLoading(true);
    try {
      const [forecastResponse, trendResponse] = await Promise.all([
        api.get('/api/reports/forecast'),
        api.get('/api/reports/balance-trend?months=6'),
      ]);
      setForecast(forecastResponse.data);
      setBalanceTrend(trendResponse.data?.timeline || []);
    } catch (error) {
      console.error('Erro ao carregar insights do dashboard:', error);
      setForecast(null);
      setBalanceTrend([]);
    } finally {
      setIsInsightLoading(false);
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      if (filterMode === 'range' && !isRangeFilterReady) {
        setTransactions([]);
        setPreviousTransactions([]);
        setHistoryPagination((current) => ({
          ...current,
          page: 1,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }));
        setIsPeriodLoading(false);
        return;
      }

      if (filterMode === 'range' && !isRangeFilterValid) {
        setTransactions([]);
        setPreviousTransactions([]);
        setHistoryPagination((current) => ({
          ...current,
          page: 1,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }));
        setIsPeriodLoading(false);
        return;
      }

      setIsPeriodLoading(true);
      try {
        const [currentResponse, previousResponse] = await Promise.all([
          api.get(`/api/transactions?${historyQueryString}`),
          api.get(`/api/transactions?${previousQueryString}`),
        ]);
        setTransactions(currentResponse.data.items);
        setHistoryPagination(currentResponse.data.pagination);
        setPreviousTransactions(previousResponse.data);
      } catch (error) {
        console.error("Erro ao buscar transações:", error);
        if (error.response?.status === 401) {
          await logout();
          navigate('/login');
        }
      } finally {
        setIsPeriodLoading(false);
      }
    };

    fetchTransactions();
  }, [debouncedSearchTerm, endDate, filterMode, historyCategoryFilter, historyPage, historyQueryString, historySortOrder, historyTypeFilter, isRangeFilterReady, isRangeFilterValid, logout, navigate, previousQueryString, selectedMonth, selectedYear, startDate]);

  useEffect(() => {
    refreshInsights();
  }, []);

  const addTransaction = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newTransaction = { description, amount: Number(amount), type, category, date };
      await api.post('/api/transactions', newTransaction);
      await Promise.all([refreshTransactions(), refreshInsights()]);
      setDescription('');
      setAmount('');
      setCategory(categories[0]);
      setDate(formatDateInput(new Date()));
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenDeleteModal = (id) => {
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setTransactionToDelete(null);
    setIsDeleteModalOpen(false);
  };
  const deleteTransaction = async () => {
    if (!transactionToDelete) return;
    try {
      await api.delete(`/api/transactions/${transactionToDelete}`);
      await Promise.all([refreshTransactions(), refreshInsights()]);
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
    }
  };

  const handleFilterChange = (year, month) => {
    setHistoryPage(1);
    setSelectedYear(parseInt(year, 10));
    setSelectedMonth(parseInt(month, 10));
  };

  const clearFilters = () => {
    setFilterMode('month');
    setActivePreset(null);
    setHistoryPage(1);
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
    const resetRange = getMonthDateRange(currentYear, currentMonth);
    setStartDate(resetRange.startDate);
    setEndDate(resetRange.endDate);
  };

  const clearHistoryFilters = () => {
    setSearchTerm('');
    setHistoryTypeFilter('all');
    setHistoryCategoryFilter('all');
    setHistorySortOrder('date_desc');
    setHistoryPage(1);
  };

  const fillExampleTransaction = () => {
    const fallbackDate = filterMode === 'range' && startDate ? startDate : formatDateInput(new Date(selectedYear, selectedMonth - 1, 15));
    setDescription('Ex.: mercado da semana');
    setAmount('120');
    setType('expense');
    setCategory('Comida');
    setDate(fallbackDate);
  };

  const shiftPeriod = (direction) => {
    const period = new Date(selectedYear, selectedMonth - 1, 1);
    period.setMonth(period.getMonth() + direction);
    setSelectedYear(period.getFullYear());
    setSelectedMonth(period.getMonth() + 1);
  };
  
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })
  }));
  const rangePresets = [
    { value: 'last7Days', label: 'Últimos 7 dias' },
    { value: 'last30Days', label: 'Últimos 30 dias' },
    { value: 'thisYear', label: 'Este ano' },
  ];
  const activePeriodLabel = formatPeriodLabel({
    filterMode,
    selectedYear,
    selectedMonth,
    startDate,
    endDate,
  });
  const periodDescriptor = filterMode === 'range' ? `no intervalo de ${activePeriodLabel}` : `em ${activePeriodLabel}`;

  const handleOpenEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  const handleUpdateTransaction = async (updatedData) => {
    try {
      await api.put(`/api/transactions/${editingTransaction._id}`, updatedData);
      handleCloseModal();
      await Promise.all([refreshTransactions(), refreshInsights()]);
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
    }
  };

  const totalIncome = transactions.reduce((acc, t) => (t.type === 'income' ? acc + t.amount : acc), 0);
  const totalExpense = transactions.reduce((acc, t) => (t.type === 'expense' ? acc + t.amount : acc), 0);
  const balance = totalIncome + totalExpense;
  const previousIncome = previousTransactions.reduce((acc, t) => (t.type === 'income' ? acc + t.amount : acc), 0);
  const previousExpense = previousTransactions.reduce((acc, t) => (t.type === 'expense' ? acc + t.amount : acc), 0);
  const previousBalance = previousIncome + previousExpense;
  const displayTransactions = transactions;
  const displayIncome = totalIncome;
  const displayExpense = totalExpense;
  const displayBalance = balance;
  const sortedTransactions = displayTransactions;
  const currentItemsCount = sortedTransactions.length;
  const hasActiveHistoryFilters = Boolean(searchTerm.trim()) || historyTypeFilter !== 'all' || historyCategoryFilter !== 'all';
  const sortOrderLabelMap = {
    date_desc: 'mais recentes primeiro',
    date_asc: 'mais antigas primeiro',
    amount_desc: 'maiores valores primeiro',
    amount_asc: 'menores valores primeiro',
  };
  const comparisonMetrics = [
    {
      label: 'Receitas',
      currentValue: displayIncome,
      previousValue: previousIncome,
      accentClass: 'text-emerald-300',
    },
    {
      label: 'Despesas',
      currentValue: Math.abs(displayExpense),
      previousValue: Math.abs(previousExpense),
      accentClass: 'text-rose-300',
    },
    {
      label: 'Saldo',
      currentValue: displayBalance,
      previousValue: previousBalance,
      accentClass: displayBalance >= 0 ? 'text-sky-200' : 'text-rose-300',
    },
  ];

  const formatComparisonChange = (currentValue, previousValue) => {
    const delta = currentValue - previousValue;

    if (delta === 0) {
      return 'Sem mudança';
    }

    const tone = delta > 0 ? 'mais' : 'menos';
    return `${currencyFormatter.format(Math.abs(delta))} ${tone}`;
  };

  const getComparisonTrend = (currentValue, previousValue, { invert = false } = {}) => {
    const delta = currentValue - previousValue;

    if (delta === 0) {
      return {
        label: 'Estável',
        value: 'Sem mudança',
        toneClass: 'text-slate-300',
        badgeClass: 'bg-white/6 text-slate-200',
        icon: 'neutral',
      };
    }

    const isPositiveTrend = invert ? delta < 0 : delta > 0;

    return {
      label: isPositiveTrend ? 'Melhor que antes' : 'Pior que antes',
      value: formatComparisonChange(currentValue, previousValue),
      toneClass: isPositiveTrend ? 'text-emerald-300' : 'text-rose-300',
      badgeClass: isPositiveTrend ? 'bg-emerald-300/12 text-emerald-200' : 'bg-rose-300/12 text-rose-200',
      icon: isPositiveTrend ? 'up' : 'down',
    };
  };
  const pageIncome = sortedTransactions.reduce((sum, transaction) => (transaction.type === 'income' ? sum + transaction.amount : sum), 0);
  const pageExpense = sortedTransactions.reduce((sum, transaction) => (transaction.type === 'expense' ? sum + Math.abs(transaction.amount) : sum), 0);
  const formatSensitiveValue = (value, formatter = currencyFormatter) => (isPrivacyMode ? '••••' : formatter.format(value));
  const exportColumns = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (BRL)'];
  const buildCsv = (rows) => {
    const escapeValue = (input) => `"${String(input ?? '').replaceAll('"', '""')}"`;
    const lines = [exportColumns.map(escapeValue).join(',')];
    rows.forEach((row) => {
      lines.push([
        new Date(row.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        row.description,
        row.category,
        row.type === 'income' ? 'Receita' : 'Despesa',
        Number(row.amount).toFixed(2).replace('.', ','),
      ].map(escapeValue).join(','));
    });
    return `${lines.join('\n')}\n`;
  };

  const exportTransactionsCsv = async () => {
    setIsExportingCsv(true);
    try {
      const exportParams = new URLSearchParams(historyQueryString);
      exportParams.delete('page');
      exportParams.delete('limit');
      const response = await api.get(`/api/transactions?${exportParams.toString()}`);
      const rows = Array.isArray(response.data) ? response.data : [];
      const chunkSize = 1200;
      const chunks = [];

      for (let i = 0; i < rows.length; i += chunkSize) {
        chunks.push(rows.slice(i, i + chunkSize));
      }

      const csvParts = [];
      for (let i = 0; i < chunks.length; i += 1) {
        const part = buildCsv(chunks[i]);
        csvParts.push(i === 0 ? part : part.split('\n').slice(1).join('\n'));
        // Cede o ciclo do event loop para manter a UI responsiva durante exportações grandes.
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      }

      const blob = new Blob(csvParts, { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-flow-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    } finally {
      setIsExportingCsv(false);
    }
  };

  const exportTransactionsPdf = async () => {
    setIsExportingPdf(true);
    try {
      const exportParams = new URLSearchParams(historyQueryString);
      exportParams.delete('page');
      exportParams.delete('limit');
      const response = await api.get(`/api/transactions?${exportParams.toString()}`);
      const rows = Array.isArray(response.data) ? response.data : [];
      const htmlRows = rows.map((row) => `
        <tr>
          <td>${new Date(row.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
          <td>${row.description}</td>
          <td>${row.category}</td>
          <td>${row.type === 'income' ? 'Receita' : 'Despesa'}</td>
          <td style="text-align:right">${Number(row.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
        </tr>
      `).join('');

      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (!printWindow) {
        throw new Error('Não foi possível abrir a janela de impressão.');
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Finance Flow - Exportação</title>
            <style>
              body { font-family: sans-serif; padding: 24px; color: #0f172a; }
              h1 { margin-bottom: 6px; }
              p { margin-top: 0; color: #475569; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; }
              th { background: #e2e8f0; text-align: left; }
            </style>
          </head>
          <body>
            <h1>Finance Flow - Transações filtradas</h1>
            <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
            <table>
              <thead>
                <tr>
                  ${exportColumns.map((column) => `<th>${column}</th>`).join('')}
                </tr>
              </thead>
              <tbody>${htmlRows}</tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <>
      <main className="page-container">
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-panel section-reveal p-6 md:p-8">
            <span className="soft-label">Visão mensal</span>
            <h2 className="mt-4 text-4xl font-bold text-slate-50 md:text-5xl">
              Olá, <span className="text-sky-300">{user?.name || 'usuário'}!</span>
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Um espaço limpo para acompanhar seus movimentos, manter consistência e tomar decisões financeiras com mais confiança.
            </p>
            <p className="mt-4 inline-flex rounded-full border border-sky-300/15 bg-sky-300/10 px-4 py-2 text-sm font-medium text-sky-100">
              Exibindo: {activePeriodLabel}
            </p>
            <button
              type="button"
              onClick={() => setIsPrivacyMode((current) => !current)}
              className="ml-3 inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              {isPrivacyMode ? 'Privacidade: ON' : 'Privacidade: OFF'}
            </button>

            <PeriodNavigator
              filterMode={filterMode}
              onModeChange={(nextMode) => {
                setFilterMode(nextMode);
                setActivePreset(null);
                setHistoryPage(1);
                if (nextMode === 'range') {
                  const selectedRange = getMonthDateRange(selectedYear, selectedMonth);
                  setStartDate(selectedRange.startDate);
                  setEndDate(selectedRange.endDate);
                }
              }}
              months={months}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={(month) => handleFilterChange(selectedYear, month)}
              onYearChange={(year) => handleFilterChange(year, selectedMonth)}
              onPrevious={() => shiftPeriod(-1)}
              onNext={() => shiftPeriod(1)}
              onReset={clearFilters}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={(value) => {
                setActivePreset(null);
                setHistoryPage(1);
                setStartDate(value);
              }}
              onEndDateChange={(value) => {
                setActivePreset(null);
                setHistoryPage(1);
                setEndDate(value);
              }}
              presets={rangePresets}
              activePreset={activePreset}
              onPresetSelect={(preset) => {
                const range = getPresetDateRange(preset, new Date());

                if (!range) {
                  return;
                }

                setFilterMode('range');
                setActivePreset(preset);
                setHistoryPage(1);
                setStartDate(range.startDate);
                setEndDate(range.endDate);
              }}
              rangeError={rangeError}
            />
          </div>

          <div className="glass-card section-reveal elevated-hover p-6">
            <span className="soft-label">Ritmo do mês</span>
            <div className={`mt-6 space-y-5 transition-opacity ${isPeriodLoading ? 'opacity-70' : 'opacity-100'}`}>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm text-slate-400">Receitas</p>
                  <p className="mt-1 text-xl font-semibold text-emerald-300">{formatSensitiveValue(displayIncome)}</p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-emerald-300/15" />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm text-slate-400">Despesas</p>
                  <p className="mt-1 text-xl font-semibold text-rose-300">{formatSensitiveValue(Math.abs(displayExpense))}</p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-rose-300/15" />
              </div>
              <div className="rounded-[22px] bg-sky-300/12 p-4">
                <p className="text-sm text-slate-300">Saldo</p>
                <p className={`mt-2 text-3xl font-semibold ${displayBalance >= 0 ? 'text-sky-200' : 'text-rose-300'}`}>
                  {formatSensitiveValue(displayBalance)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {comparisonMetrics.map((metric) => (
            (() => {
              const trend = getComparisonTrend(metric.currentValue, metric.previousValue, {
                invert: metric.label === 'Despesas',
              });

              return (
                <div key={metric.label} className={`metric-card section-reveal elevated-hover transition-opacity ${isPeriodLoading ? 'opacity-70' : 'opacity-100'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="soft-label">{metric.label}</p>
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${trend.badgeClass}`}>
                      {trend.icon === 'up' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      ) : trend.icon === 'down' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-current" />
                      )}
                      {trend.label}
                    </span>
                  </div>
                  <p className={`metric-value ${metric.accentClass}`}>{formatSensitiveValue(metric.currentValue)}</p>
                  <p className="mt-3 text-sm text-slate-400">
                    vs. {previousPeriodLabel}: <span className="font-medium text-slate-200">{formatSensitiveValue(metric.previousValue)}</span>
                  </p>
                  <p className={`mt-1 text-sm font-medium ${trend.toneClass}`}>{isPrivacyMode ? '••••' : trend.value}</p>
                </div>
              );
            })()
          ))}
        </section>

        <section className="mt-6">
          <InsightsPanel
            isInsightLoading={isInsightLoading}
            forecast={forecast}
            formatSensitiveValue={formatSensitiveValue}
          />
        </section>

        <section className="mt-6">
          <TrendChartCard
            balanceTrend={balanceTrend}
            isPrivacyMode={isPrivacyMode}
            formatSensitiveValue={formatSensitiveValue}
            isExportingCsv={isExportingCsv}
            isExportingPdf={isExportingPdf}
            onExportCsv={exportTransactionsCsv}
            onExportPdf={exportTransactionsPdf}
          />
        </section>

        <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(420px,0.92fr)_minmax(560px,1.08fr)]">
          <div className="glass-panel section-reveal p-6 md:p-8 xl:p-9">
            <span className="soft-label">Novo lançamento</span>
            <h3 className="mt-3 text-3xl font-bold text-slate-50">Adicionar transação</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              O filtro atual está {periodDescriptor}. Escolha a data do lançamento abaixo para registrar a movimentação corretamente.
            </p>
            <form onSubmit={addTransaction} className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-200">Descrição</label>
                <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="input-shell" placeholder="Ex.: mercado, salário, aluguel" />
              </div>
              <div>
                <label htmlFor="date" className="mb-2 block text-sm font-medium text-slate-200">Data</label>
                <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="input-shell" />
              </div>
              <div>
                <label htmlFor="category" className="mb-2 block text-sm font-medium text-slate-200">Categoria</label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="input-shell">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="amount" className="mb-2 block text-sm font-medium text-slate-200">Valor</label>
                <input type="number" step="0.01" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required className="input-shell" placeholder="0,00" />
              </div>
              <div>
                <label htmlFor="type" className="mb-2 block text-sm font-medium text-slate-200">Tipo</label>
                <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="input-shell">
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </div>
              <div className="lg:col-span-2">
                <button type="submit" disabled={isLoading} className="primary-button mt-2 w-full disabled:opacity-60">
                {isLoading ? <Spinner /> : 'Adicionar ao meu mês'}
                </button>
              </div>
            </form>
          </div>

          <div className="glass-panel section-reveal p-6 md:p-8 xl:p-9">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="soft-label">Histórico</span>
                <h3 className="mt-3 text-3xl font-bold text-slate-50">Movimentações de {activePeriodLabel}</h3>
              </div>
              <p className="text-sm text-slate-400">
                {rangeError ? rangeError : isPeriodLoading ? `Atualizando ${activePeriodLabel}...` : `Ordenado por ${sortOrderLabelMap[historySortOrder]}.`}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {!rangeError && (
                <HistoryFiltersPanel
                  categories={categories}
                  searchTerm={searchTerm}
                  debouncedSearchTerm={debouncedSearchTerm}
                  historyTypeFilter={historyTypeFilter}
                  historyCategoryFilter={historyCategoryFilter}
                  historySortOrder={historySortOrder}
                  historyPagination={historyPagination}
                  currentItemsCount={currentItemsCount}
                  pageIncome={pageIncome}
                  pageExpense={pageExpense}
                  currencyFormatter={currencyFormatter}
                  onSearchChange={(value) => {
                    setHistoryPage(1);
                    setSearchTerm(value);
                  }}
                  onTypeChange={(value) => {
                    setHistoryPage(1);
                    setHistoryTypeFilter(value);
                  }}
                  onCategoryChange={(value) => {
                    setHistoryPage(1);
                    setHistoryCategoryFilter(value);
                  }}
                  onSortChange={(value) => {
                    setHistoryPage(1);
                    setHistorySortOrder(value);
                  }}
                  onClear={clearHistoryFilters}
                />
              )}

              {isPeriodLoading && !rangeError && (
                <>
                  <PeriodLoadingCard lines={1} className="!p-4" />
                  <PeriodLoadingCard lines={1} className="!p-4" />
                </>
              )}

              {!rangeError && !isPeriodLoading && sortedTransactions.length > 0 ? (
                <>
                  {sortedTransactions.map(t => (
                    <div key={t._id} className="glass-card elevated-hover flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex-grow">
                        <span className="inline-flex rounded-full bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">{t.category}</span>
                        <span className="mt-3 block text-base font-semibold text-slate-100 md:text-lg">{t.description}</span>
                        <span className="mt-1 block text-sm text-slate-400">{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 md:justify-end">
                        <span className={`text-base font-bold md:text-lg ${t.amount < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>{formatSensitiveValue(t.amount)}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleOpenEditModal(t)} className="rounded-2xl bg-white/6 p-2 text-slate-300 transition hover:bg-sky-300/10 hover:text-sky-200" aria-label="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => handleOpenDeleteModal(t._id)} className="rounded-2xl bg-white/6 p-2 text-slate-300 transition hover:bg-rose-300/10 hover:text-rose-200" aria-label="Deletar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {historyPagination.totalPages > 1 ? (
                    <div className="glass-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-400">
                        Página <span className="font-medium text-slate-100">{historyPagination.page}</span> de{' '}
                        <span className="font-medium text-slate-100">{historyPagination.totalPages}</span>
                        {' '}com <span className="font-medium text-slate-100">{historyPagination.totalItems}</span> lançamentos.
                      </p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setHistoryPage((current) => Math.max(1, current - 1))}
                          disabled={!historyPagination.hasPreviousPage}
                          className="secondary-button text-sm disabled:opacity-50"
                        >
                          Página anterior
                        </button>
                        <button
                          type="button"
                          onClick={() => setHistoryPage((current) => current + 1)}
                          disabled={!historyPagination.hasNextPage}
                          className="secondary-button text-sm disabled:opacity-50"
                        >
                          Próxima página
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : !rangeError && !isPeriodLoading ? (
                <div className="glass-card flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-300/12 text-sky-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v-1m-7-4h14" />
                    </svg>
                  </div>
                  {hasActiveHistoryFilters && displayTransactions.length > 0 ? (
                    <>
                      <h4 className="mt-5 text-2xl font-bold text-slate-50">Nenhum resultado para os filtros atuais</h4>
                      <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                        Tente mudar a busca, o tipo ou a categoria para encontrar a movimentação que você procura.
                      </p>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button type="button" onClick={clearHistoryFilters} className="primary-button">
                          Limpar filtros do histórico
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="mt-5 text-2xl font-bold text-slate-50">Nenhuma transação {periodDescriptor}</h4>
                      <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                        Comece registrando sua primeira movimentação para ver o resumo financeiro e o histórico deste período.
                      </p>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button type="button" onClick={fillExampleTransaction} className="primary-button">
                          Preencher exemplo no formulário
                        </button>
                        <button type="button" onClick={clearFilters} className="secondary-button">
                          Voltar para o mês atual
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : rangeError ? (
                <div className="glass-card flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
                  <h4 className="text-2xl font-bold text-slate-50">Ajuste o intervalo para continuar</h4>
                  <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                    Escolha uma data inicial anterior ou igual à data final para carregar as transações desse recorte.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <EditModal isOpen={isEditModalOpen} onClose={handleCloseModal} transaction={editingTransaction} onSave={handleUpdateTransaction} />
      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} onConfirm={deleteTransaction} message="Tem certeza que deseja excluir esta transação? A ação não pode ser desfeita."/>
    </>
  );
}

export default DashboardPage;
