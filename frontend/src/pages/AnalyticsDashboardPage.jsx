import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF'];

function AnalyticsDashboardPage() {
  const [summaryData, setSummaryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchSummaryData = async () => {
      setIsLoading(true);
      try {
        const token = getToken();
        const url = `${API_BASE_URL}/api/reports/summary-by-category?year=${selectedYear}&month=${selectedMonth}`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSummaryData(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do resumo:", error);
        setSummaryData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaryData();
  }, [selectedYear, selectedMonth]);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })
  }));

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">Análise Mensal de Despesas</h2>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row items-center gap-4 flex-wrap">
        <span className="font-semibold text-gray-700">Filtrar por:</span>
        <div className="flex gap-4">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="border border-gray-300 rounded-md p-2">
            {months.map(m => <option key={m.value} value={m.value}>{m.label.charAt(0).toUpperCase() + m.label.slice(1)}</option>)}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="border border-gray-300 rounded-md p-2">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md" style={{ height: '500px' }}>
        {isLoading ? (
          <p>Carregando dados...</p>
        ) : summaryData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={summaryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {summaryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Nenhuma despesa encontrada para este período.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsDashboardPage;