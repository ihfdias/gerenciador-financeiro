import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import EditModal from '../components/EditModal';
import ConfirmationModal from '../components/ConfirmationModal';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
const categories = ["Salário", "Comida", "Transporte", "Moradia", "Lazer", "Saúde", "Educação", "Investimentos", "Outros"];

const previewTransactions = [
  {
    _id: 'preview-1',
    category: 'Salário',
    description: 'Pagamento mensal',
    date: '2026-04-05',
    amount: 4850,
  },
  {
    _id: 'preview-2',
    category: 'Moradia',
    description: 'Aluguel do apartamento',
    date: '2026-04-07',
    amount: -1650,
  },
  {
    _id: 'preview-3',
    category: 'Comida',
    description: 'Compras do mercado',
    date: '2026-04-09',
    amount: -420.7,
  },
  {
    _id: 'preview-4',
    category: 'Investimentos',
    description: 'Aporte mensal',
    date: '2026-04-12',
    amount: -600,
  },
];

function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const { logout, user } = useAuth();

  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get(`/api/transactions?year=${selectedYear}&month=${selectedMonth}`);
        setTransactions(response.data);
      } catch (error) {
        console.error("Erro ao buscar transações:", error);
        if (error.response?.status === 401) {
          await logout();
          navigate('/login');
        }
      }
    };

    fetchTransactions();
  }, [logout, navigate, selectedMonth, selectedYear]);

  const refreshTransactions = async () => {
    const response = await api.get(`/api/transactions?year=${selectedYear}&month=${selectedMonth}`);
    setTransactions(response.data);
  };

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
      setDate(new Date().toISOString().split('T')[0]);
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
    setSelectedYear(parseInt(year));
    setSelectedMonth(parseInt(month));
  };

  const clearFilters = () => {
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth(new Date().getMonth() + 1);
  };
  
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })
  }));

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
  const hasTransactions = transactions.length > 0;
  const displayTransactions = hasTransactions ? transactions : previewTransactions;
  const previewIncome = previewTransactions.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0);
  const previewExpense = previewTransactions.filter((item) => item.amount < 0).reduce((sum, item) => sum + item.amount, 0);
  const displayIncome = hasTransactions ? totalIncome : previewIncome;
  const displayExpense = hasTransactions ? totalExpense : previewExpense;
  const displayBalance = hasTransactions ? balance : previewIncome + previewExpense;

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

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex flex-wrap gap-3">
                <select value={selectedMonth} onChange={(e) => handleFilterChange(selectedYear, e.target.value)} className="input-shell min-w-[180px]">
                  {months.map(m => <option key={m.value} value={m.value}>{m.label.charAt(0).toUpperCase() + m.label.slice(1)}</option>)}
                </select>
                <select value={selectedYear} onChange={(e) => handleFilterChange(e.target.value, selectedMonth)} className="input-shell min-w-[140px]">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <button onClick={clearFilters} className="secondary-button text-sm">
                Voltar para o mês atual
              </button>
            </div>
          </div>

          <div className="glass-card section-reveal elevated-hover p-6">
            <span className="soft-label">Ritmo do mês</span>
            <div className="mt-6 space-y-5">
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
          <div className="metric-card section-reveal elevated-hover">
            <p className="soft-label">Receitas</p>
            <p className="metric-value text-emerald-300">{currencyFormatter.format(displayIncome)}</p>
          </div>
          <div className="metric-card section-reveal elevated-hover">
            <p className="soft-label">Despesas</p>
            <p className="metric-value text-rose-300">{currencyFormatter.format(Math.abs(displayExpense))}</p>
          </div>
          <div className="metric-card section-reveal elevated-hover">
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
                <h3 className="mt-3 text-3xl font-bold text-slate-50">Movimentações do período</h3>
              </div>
              <p className="text-sm text-slate-400">Ordenado das mais recentes para as mais antigas.</p>
            </div>

            <div className="mt-6 space-y-3">
              {!hasTransactions && (
                <div className="rounded-2xl border border-sky-300/15 bg-sky-300/10 px-4 py-3 text-sm text-sky-100">
                  Prévia visual com dados fictícios para mostrar como o painel ficará quando você começar a usar o sistema.
                </div>
              )}

              {displayTransactions.length > 0 ? (
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
              ) : (
                <div className="glass-card flex min-h-[220px] items-center justify-center p-6 text-center text-slate-400">
                  Nenhuma transação encontrada para este mês.
                </div>
              )}
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
