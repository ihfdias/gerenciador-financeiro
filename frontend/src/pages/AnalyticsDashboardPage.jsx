import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF'];
const previewSummaryData = [
  { name: 'Moradia', value: 1650 },
  { name: 'Comida', value: 420.7 },
  { name: 'Investimentos', value: 600 },
  { name: 'Lazer', value: 260 },
  { name: 'Transporte', value: 180 },
];

function AnalyticsDashboardPage() {
  const [summaryData, setSummaryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isCompact, setIsCompact] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const { logout } = useAuth();

  useEffect(() => {
    const fetchSummaryData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/reports/summary-by-category?year=${selectedYear}&month=${selectedMonth}`);
        setSummaryData(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do resumo:", error);
        if (error.response?.status === 401) {
          await logout();
        }
        setSummaryData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaryData();
  }, [logout, selectedMonth, selectedYear]);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })
  }));
  const displaySummaryData = summaryData.length > 0 ? summaryData : previewSummaryData;
  const isPreview = summaryData.length === 0;
  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

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
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="input-shell min-w-[180px]">
              {months.map(m => <option key={m.value} value={m.value}>{m.label.charAt(0).toUpperCase() + m.label.slice(1)}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="input-shell min-w-[140px]">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="glass-card section-reveal elevated-hover p-6">
          <span className="soft-label">Leitura rápida</span>
          {isPreview && (
            <p className="mt-4 rounded-2xl border border-sky-300/15 bg-sky-300/10 px-4 py-3 text-sm text-sky-100">
              Prévia visual com categorias fictícias para você sentir a apresentação da análise.
            </p>
          )}
          <div className="mt-6 space-y-4">
            {displaySummaryData.length > 0 ? displaySummaryData.slice(0, 5).map((item) => (
              <div key={item.name} className="rounded-2xl bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-slate-100">{item.name}</p>
                  <p className="text-sm font-semibold text-sky-200">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                  </p>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl bg-white/5 p-4 text-sm leading-7 text-slate-300">
                Quando houver despesas no período, você verá aqui as categorias mais relevantes.
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel section-reveal p-6">
          <div className="mb-4">
            <span className="soft-label">Distribuição</span>
            <h3 className="mt-3 text-3xl font-bold text-slate-50">Participação por categoria</h3>
          </div>
          <div className="glass-card p-4" style={{ height: isCompact ? '360px' : '500px' }}>
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-slate-300">Carregando dados...</div>
            ) : displaySummaryData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Nenhuma despesa encontrada para este período.</p>
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
