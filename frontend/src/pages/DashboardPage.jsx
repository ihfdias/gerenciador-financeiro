import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import EditModal from '../components/EditModal';
import ConfirmationModal from '../components/ConfirmationModal';
import PeriodNavigator from '../components/PeriodNavigator';
import PeriodLoadingCard from '../components/PeriodLoadingCard';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import {
  buildPeriodQuery,
  formatDateInput,
  formatPeriodLabel,
  getMonthDateRange,
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSeedingSampleData, setIsSeedingSampleData] = useState(false);
  const [isPeriodLoading, setIsPeriodLoading] = useState(false);
  const [sampleDataFeedback, setSampleDataFeedback] = useState(null);
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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const { logout, user } = useAuth();

  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const isRangeFilterReady = isRangeReady(startDate, endDate);
  const isRangeFilterValid = isRangeValid(startDate, endDate);
  const rangeError = filterMode === 'range' && isRangeFilterReady && !isRangeFilterValid
    ? 'A data inicial precisa ser anterior ou igual à data final.'
    : '';
  const queryString = buildPeriodQuery({ filterMode, selectedYear, selectedMonth, startDate, endDate });

  const refreshTransactions = async () => {
    if (filterMode === 'range' && (!isRangeFilterReady || !isRangeFilterValid)) {
      setTransactions([]);
      return;
    }

    const response = await api.get(`/api/transactions?${queryString}`);
    setTransactions(response.data);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      if (filterMode === 'range' && !isRangeFilterReady) {
        setTransactions([]);
        setIsPeriodLoading(false);
        return;
      }

      if (filterMode === 'range' && !isRangeFilterValid) {
        setTransactions([]);
        setIsPeriodLoading(false);
        return;
      }

      setIsPeriodLoading(true);
      try {
        const response = await api.get(`/api/transactions?${queryString}`);
        setTransactions(response.data);
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
  }, [endDate, filterMode, isRangeFilterReady, isRangeFilterValid, logout, navigate, queryString, selectedMonth, selectedYear, startDate]);

  const addTransaction = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newTransaction = { description, amount: Number(amount), type, category, date };
      await api.post('/api/transactions', newTransaction);
      await refreshTransactions();
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
      await refreshTransactions();
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
    }
  };

  const handleFilterChange = (year, month) => {
    setSelectedYear(parseInt(year, 10));
    setSelectedMonth(parseInt(month, 10));
  };

  const clearFilters = () => {
    setFilterMode('month');
    setActivePreset(null);
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
    const resetRange = getMonthDateRange(currentYear, currentMonth);
    setStartDate(resetRange.startDate);
    setEndDate(resetRange.endDate);
  };

  const fillExampleTransaction = () => {
    const fallbackDate = filterMode === 'range' && startDate ? startDate : formatDateInput(new Date(selectedYear, selectedMonth - 1, 15));
    setDescription('Ex.: mercado da semana');
    setAmount('120');
    setType('expense');
    setCategory('Comida');
    setDate(fallbackDate);
  };

  const createSampleTransactions = async () => {
    const sampleEntries = [
      {
        description: 'Salário principal',
        amount: 5200,
        type: 'income',
        category: 'Salário',
        date: formatDateInput(new Date(currentYear, currentMonth - 1, 5)),
      },
      {
        description: 'Mercado do mês',
        amount: 480,
        type: 'expense',
        category: 'Comida',
        date: formatDateInput(new Date(currentYear, currentMonth - 1, 9)),
      },
      {
        description: 'Aluguel',
        amount: 1650,
        type: 'expense',
        category: 'Moradia',
        date: formatDateInput(new Date(currentYear, currentMonth - 1, 10)),
      },
      {
        description: 'Freelance',
        amount: 1250,
        type: 'income',
        category: 'Outros',
        date: formatDateInput(new Date(currentYear, currentMonth - 2, 18)),
      },
      {
        description: 'Aplicação mensal',
        amount: 700,
        type: 'expense',
        category: 'Investimentos',
        date: formatDateInput(new Date(currentYear, currentMonth - 2, 22)),
      },
      {
        description: 'Fim de semana',
        amount: 230,
        type: 'expense',
        category: 'Lazer',
        date: formatDateInput(new Date(currentYear, currentMonth - 3, 14)),
      },
      {
        description: 'Transporte por app',
        amount: 140,
        type: 'expense',
        category: 'Transporte',
        date: formatDateInput(new Date(currentYear, currentMonth - 4, 7)),
      },
      {
        description: 'Consulta de rotina',
        amount: 180,
        type: 'expense',
        category: 'Saúde',
        date: formatDateInput(new Date(currentYear, currentMonth - 5, 11)),
      },
    ];

    setIsSeedingSampleData(true);
    setSampleDataFeedback(null);

    try {
      const sampleDates = sampleEntries.map((entry) => entry.date).sort();
      const response = await api.get(`/api/transactions?startDate=${sampleDates[0]}&endDate=${sampleDates[sampleDates.length - 1]}`);
      const existingTransactions = response.data;
      const existingKeys = new Set(
        existingTransactions.map((transaction) => {
          const normalizedAmount = transaction.type === 'expense'
            ? Math.abs(transaction.amount)
            : transaction.amount;

          return [
            transaction.description,
            normalizedAmount,
            transaction.type,
            transaction.category,
            formatDateInput(new Date(transaction.date)),
          ].join('|');
        })
      );

      const entriesToCreate = sampleEntries.filter((entry) => {
        const key = [entry.description, entry.amount, entry.type, entry.category, entry.date].join('|');
        return !existingKeys.has(key);
      });

      if (entriesToCreate.length > 0) {
        await Promise.all(entriesToCreate.map((entry) => api.post('/api/transactions', entry)));
      }

      await refreshTransactions();
      setSampleDataFeedback({
        tone: entriesToCreate.length > 0 ? 'success' : 'info',
        message: entriesToCreate.length > 0
          ? `${entriesToCreate.length} lançamentos de teste foram adicionados em meses diferentes.`
          : 'Os lançamentos de teste já existem na sua conta. Nada foi duplicado.',
      });
    } catch (error) {
      console.error('Erro ao criar dados de teste:', error);
      setSampleDataFeedback({
        tone: 'error',
        message: 'Não foi possível popular os meses com dados de teste agora.',
      });
    } finally {
      setIsSeedingSampleData(false);
    }
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
      await refreshTransactions();
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
    }
  };

  const totalIncome = transactions.reduce((acc, t) => (t.type === 'income' ? acc + t.amount : acc), 0);
  const totalExpense = transactions.reduce((acc, t) => (t.type === 'expense' ? acc + t.amount : acc), 0);
  const balance = totalIncome + totalExpense;
  const displayTransactions = transactions;
  const displayIncome = totalIncome;
  const displayExpense = totalExpense;
  const displayBalance = balance;

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
              onMonthChange={(month) => handleFilterChange(selectedYear, month)}
              onYearChange={(year) => handleFilterChange(year, selectedMonth)}
              onPrevious={() => shiftPeriod(-1)}
              onNext={() => shiftPeriod(1)}
              onReset={clearFilters}
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

          <div className="glass-card section-reveal elevated-hover p-6">
            <span className="soft-label">Ritmo do mês</span>
            <div className={`mt-6 space-y-5 transition-opacity ${isPeriodLoading ? 'opacity-70' : 'opacity-100'}`}>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm text-slate-400">Receitas</p>
                  <p className="mt-1 text-xl font-semibold text-emerald-300">{currencyFormatter.format(displayIncome)}</p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-emerald-300/15" />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm text-slate-400">Despesas</p>
                  <p className="mt-1 text-xl font-semibold text-rose-300">{currencyFormatter.format(Math.abs(displayExpense))}</p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-rose-300/15" />
              </div>
              <div className="rounded-[22px] bg-sky-300/12 p-4">
                <p className="text-sm text-slate-300">Saldo</p>
                <p className={`mt-2 text-3xl font-semibold ${displayBalance >= 0 ? 'text-sky-200' : 'text-rose-300'}`}>
                  {currencyFormatter.format(displayBalance)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className={`metric-card section-reveal elevated-hover transition-opacity ${isPeriodLoading ? 'opacity-70' : 'opacity-100'}`}>
            <p className="soft-label">Receitas</p>
            <p className="metric-value text-emerald-300">{currencyFormatter.format(displayIncome)}</p>
          </div>
          <div className={`metric-card section-reveal elevated-hover transition-opacity ${isPeriodLoading ? 'opacity-70' : 'opacity-100'}`}>
            <p className="soft-label">Despesas</p>
            <p className="metric-value text-rose-300">{currencyFormatter.format(Math.abs(displayExpense))}</p>
          </div>
          <div className={`metric-card section-reveal elevated-hover transition-opacity ${isPeriodLoading ? 'opacity-70' : 'opacity-100'}`}>
            <p className="soft-label">Saldo</p>
            <p className={`metric-value ${displayBalance >= 0 ? 'text-sky-200' : 'text-rose-300'}`}>
              {currencyFormatter.format(displayBalance)}
            </p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-panel section-reveal p-6 md:p-8">
            <span className="soft-label">Novo lançamento</span>
            <h3 className="mt-3 text-3xl font-bold text-slate-50">Adicionar transação</h3>
            <p className="mt-2 text-sm text-slate-400">O filtro atual está {periodDescriptor}. Escolha a data do lançamento abaixo para registrar a movimentação corretamente.</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-100">Teste visual rápido</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Preencha alguns meses com lançamentos de exemplo para validar os filtros e a análise com dados reais.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={createSampleTransactions}
                  disabled={isSeedingSampleData}
                  className="secondary-button text-sm disabled:opacity-60"
                >
                  {isSeedingSampleData ? 'Criando dados...' : 'Popular meses com dados'}
                </button>
              </div>
              {sampleDataFeedback ? (
                <p
                  className={`mt-3 text-sm ${
                    sampleDataFeedback.tone === 'success'
                      ? 'text-emerald-300'
                      : sampleDataFeedback.tone === 'error'
                        ? 'text-rose-300'
                        : 'text-sky-200'
                  }`}
                >
                  {sampleDataFeedback.message}
                </p>
              ) : null}
            </div>
            <form onSubmit={addTransaction} className="mt-6 space-y-4">
              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-200">Descrição</label>
                <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="input-shell" placeholder="Ex.: mercado, salário, aluguel" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
              <button type="submit" disabled={isLoading} className="primary-button mt-2 w-full disabled:opacity-60">
                {isLoading ? <Spinner /> : 'Adicionar ao meu mês'}
              </button>
            </form>
          </div>

          <div className="glass-panel section-reveal p-6 md:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="soft-label">Histórico</span>
                <h3 className="mt-3 text-3xl font-bold text-slate-50">Movimentações de {activePeriodLabel}</h3>
              </div>
              <p className="text-sm text-slate-400">
                {rangeError ? rangeError : isPeriodLoading ? `Atualizando ${activePeriodLabel}...` : 'Ordenado das mais recentes para as mais antigas.'}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {isPeriodLoading && !rangeError && (
                <>
                  <PeriodLoadingCard lines={1} className="!p-4" />
                  <PeriodLoadingCard lines={1} className="!p-4" />
                </>
              )}

              {!rangeError && !isPeriodLoading && displayTransactions.length > 0 ? (
                displayTransactions.map(t => (
                  <div key={t._id} className="glass-card elevated-hover flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-grow">
                      <span className="inline-flex rounded-full bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">{t.category}</span>
                      <span className="mt-3 block text-base font-semibold text-slate-100 md:text-lg">{t.description}</span>
                      <span className="mt-1 block text-sm text-slate-400">{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <span className={`text-base font-bold md:text-lg ${t.amount < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>{currencyFormatter.format(t.amount)}</span>
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
                ))
              ) : !rangeError && !isPeriodLoading ? (
                <div className="glass-card flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-300/12 text-sky-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v-1m-7-4h14" />
                    </svg>
                  </div>
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
