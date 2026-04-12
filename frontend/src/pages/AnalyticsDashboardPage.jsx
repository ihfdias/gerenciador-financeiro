import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import PeriodNavigator from '../components/PeriodNavigator';
import PeriodLoadingCard from '../components/PeriodLoadingCard';
import {
  buildPeriodQuery,
  getComparisonLabel,
  formatPeriodLabel,
  getMonthDateRange,
  getPreviousPeriodParams,
  getPresetDateRange,
  isRangeReady,
  isRangeValid,
} from '../utils/period';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF'];

function AnalyticsDashboardPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentMonthRange = getMonthDateRange(currentYear, currentMonth);
  const [summaryData, setSummaryData] = useState([]);
  const [previousSummaryData, setPreviousSummaryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('month');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [startDate, setStartDate] = useState(currentMonthRange.startDate);
  const [endDate, setEndDate] = useState(currentMonthRange.endDate);
  const [activePreset, setActivePreset] = useState(null);
  const [isCompact, setIsCompact] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const { logout } = useAuth();
  const isRangeFilterReady = isRangeReady(startDate, endDate);
  const isRangeFilterValid = isRangeValid(startDate, endDate);
  const rangeError = filterMode === 'range' && isRangeFilterReady && !isRangeFilterValid
    ? 'A data inicial precisa ser anterior ou igual à data final.'
    : '';
  const queryString = buildPeriodQuery({ filterMode, selectedYear, selectedMonth, startDate, endDate });
  const previousPeriodParams = getPreviousPeriodParams({ filterMode, selectedYear, selectedMonth, startDate, endDate });
  const previousQueryString = buildPeriodQuery({
    filterMode: previousPeriodParams.filterMode,
    selectedYear: previousPeriodParams.selectedYear,
    selectedMonth: previousPeriodParams.selectedMonth,
    startDate: previousPeriodParams.startDate,
    endDate: previousPeriodParams.endDate,
  });
  const previousPeriodLabel = getComparisonLabel(previousPeriodParams);

  useEffect(() => {
    const fetchSummaryData = async () => {
      if (filterMode === 'range' && !isRangeFilterReady) {
        setSummaryData([]);
        setPreviousSummaryData([]);
        setIsLoading(false);
        return;
      }

      if (filterMode === 'range' && !isRangeFilterValid) {
        setSummaryData([]);
        setPreviousSummaryData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [currentResponse, previousResponse] = await Promise.all([
          api.get(`/api/reports/summary-by-category?${queryString}`),
          api.get(`/api/reports/summary-by-category?${previousQueryString}`),
        ]);
        setSummaryData(currentResponse.data);
        setPreviousSummaryData(previousResponse.data);
      } catch (error) {
        console.error("Erro ao buscar dados do resumo:", error);
        if (error.response?.status === 401) {
          await logout();
        }
        setSummaryData([]);
        setPreviousSummaryData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaryData();
  }, [endDate, filterMode, isRangeFilterReady, isRangeFilterValid, logout, previousQueryString, queryString, selectedMonth, selectedYear, startDate]);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const displaySummaryData = summaryData;
  const totalCurrentExpenses = displaySummaryData.reduce((sum, item) => sum + item.value, 0);
  const totalPreviousExpenses = previousSummaryData.reduce((sum, item) => sum + item.value, 0);
  const leadingCategory = displaySummaryData[0];
  const previousLeadingCategory = previousSummaryData[0];
  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const totalDifference = totalCurrentExpenses - totalPreviousExpenses;
  const totalDifferenceLabel = totalDifference === 0
    ? 'Sem mudança no total de despesas'
    : `${currencyFormatter.format(Math.abs(totalDifference))} ${totalDifference > 0 ? 'a mais' : 'a menos'}`;
  const shiftPeriod = (direction) => {
    const period = new Date(selectedYear, selectedMonth - 1, 1);
    period.setMonth(period.getMonth() + direction);
    setSelectedYear(period.getFullYear());
    setSelectedMonth(period.getMonth() + 1);
  };

  return (
    <div className="page-container">
      <section className="glass-panel section-reveal p-6 md:p-8">
        <span className="soft-label">Insights</span>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-4xl font-bold text-slate-50 md:text-5xl">Análise mensal de despesas</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Veja para onde seu dinheiro está indo e identifique padrões com uma visualização mais clara e comparável.
            </p>
            <p className="mt-4 inline-flex rounded-full border border-sky-300/15 bg-sky-300/10 px-4 py-2 text-sm font-medium text-sky-100">
              Exibindo: {activePeriodLabel}
            </p>
          </div>
          <PeriodNavigator
            filterMode={filterMode}
            onModeChange={(nextMode) => {
              setFilterMode(nextMode);
              setActivePreset(null);
              if (nextMode === 'range') {
                const selectedRange = getMonthDateRange(selectedYear, selectedMonth);
                setStartDate(selectedRange.startDate);
                setEndDate(selectedRange.endDate);
              }
            }}
            months={months}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={(month) => setSelectedMonth(parseInt(month, 10))}
            onYearChange={(year) => setSelectedYear(parseInt(year, 10))}
            onPrevious={() => shiftPeriod(-1)}
            onNext={() => shiftPeriod(1)}
            onReset={() => {
              setFilterMode('month');
              setActivePreset(null);
              setSelectedYear(currentYear);
              setSelectedMonth(currentMonth);
              const resetRange = getMonthDateRange(currentYear, currentMonth);
              setStartDate(resetRange.startDate);
              setEndDate(resetRange.endDate);
            }}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={(value) => {
              setActivePreset(null);
              setStartDate(value);
            }}
            onEndDateChange={(value) => {
              setActivePreset(null);
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
              setStartDate(range.startDate);
              setEndDate(range.endDate);
            }}
            rangeError={rangeError}
          />
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="glass-card section-reveal elevated-hover p-6">
          <span className="soft-label">Leitura rápida</span>
          <h3 className="mt-3 text-2xl font-bold text-slate-50">Categorias de {activePeriodLabel}</h3>
          <div className="mt-6 space-y-4">
            {!isLoading && !rangeError ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Comparativo com {previousPeriodLabel}</p>
                <p className="mt-2 text-xl font-semibold text-slate-100">{currencyFormatter.format(totalCurrentExpenses)}</p>
                <p className="mt-1 text-sm text-slate-300">
                  Antes: <span className="font-medium text-slate-100">{currencyFormatter.format(totalPreviousExpenses)}</span>
                </p>
                <p className="mt-1 text-sm text-slate-400">{totalDifferenceLabel}</p>
                <p className="mt-3 text-sm text-slate-300">
                  Categoria líder: <span className="font-medium text-slate-100">{leadingCategory ? leadingCategory.name : 'Sem despesas'}</span>
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Antes: {previousLeadingCategory ? previousLeadingCategory.name : 'Sem despesas'}
                </p>
              </div>
            ) : null}
            {isLoading && !rangeError ? (
              <PeriodLoadingCard lines={4} className="!border-transparent !bg-transparent !p-0 shadow-none" />
            ) : !rangeError && displaySummaryData.length > 0 ? displaySummaryData.slice(0, 5).map((item) => (
              <div key={item.name} className="rounded-2xl bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-slate-100">{item.name}</p>
                  <p className="text-sm font-semibold text-sky-200">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                  </p>
                </div>
              </div>
            )) : rangeError ? (
              <div className="rounded-2xl bg-white/5 p-5 text-sm leading-7 text-rose-300">
                Ajuste o intervalo para continuar. A data inicial precisa ser anterior ou igual à data final.
              </div>
            ) : (
              <div className="rounded-2xl bg-white/5 p-5 text-sm leading-7 text-slate-300">
                Nenhuma despesa encontrada para {activePeriodLabel}. Quando você registrar gastos nesse período, as categorias mais relevantes aparecerão aqui.
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel section-reveal p-6">
          <div className="mb-4">
            <span className="soft-label">Distribuição</span>
            <h3 className="mt-3 text-3xl font-bold text-slate-50">Participação por categoria em {activePeriodLabel}</h3>
          </div>
          <div className="glass-card p-4" style={{ height: isCompact ? '360px' : '500px' }}>
            {isLoading ? (
              <div className="flex h-full flex-col justify-center gap-4">
                <div className="skeleton-block mx-auto h-56 w-56 rounded-full" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="skeleton-block h-12 w-full" />
                  <div className="skeleton-block h-12 w-full" />
                </div>
              </div>
            ) : !rangeError && displaySummaryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displaySummaryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={isCompact ? false : ({ name, percent, x, y, cx }) => (
                      <text
                        x={x}
                        y={y}
                        fill="#e2e8f0"
                        fontSize="14"
                        fontWeight="600"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                      >
                        {`${name} (${(percent * 100).toFixed(0)}%)`}
                      </text>
                    )}
                    outerRadius={isCompact ? 108 : 150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {displaySummaryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.96)',
                      border: '1px solid rgba(148,163,184,0.18)',
                      borderRadius: '18px',
                      color: '#e2e8f0',
                      boxShadow: '0 20px 45px rgba(2, 6, 23, 0.35)',
                    }}
                    itemStyle={{ color: '#e2e8f0' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value) => currencyFormatter.format(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : rangeError ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-lg font-semibold text-slate-100">Intervalo inválido</p>
                <p className="mt-2 max-w-sm text-sm leading-7 text-slate-400">
                  Escolha uma data inicial anterior ou igual à data final para montar o gráfico desse recorte.
                </p>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-300/12 text-sky-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6m3 6V7m3 10v-4m3 7H3" />
                  </svg>
                </div>
                <p className="mt-5 text-lg font-semibold text-slate-100">Ainda não há dados para {activePeriodLabel}</p>
                <p className="mt-2 max-w-sm text-sm leading-7 text-slate-400">
                  Assim que você lançar despesas nesse período, o gráfico vai mostrar a participação de cada categoria.
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {displaySummaryData.map((item, index) => (
              <div key={item.name} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <p className="font-semibold text-slate-100">{item.name}</p>
                </div>
                <p className="mt-2 text-sm text-slate-400">{currencyFormatter.format(item.value)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AnalyticsDashboardPage;
