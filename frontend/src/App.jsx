import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Toast = ({ message, type, show }) => {
  if (!show) return null;
  const baseClasses = "fixed bottom-5 right-5 p-4 rounded-md shadow-lg text-white transition-opacity duration-300";
  const typeClasses = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  return (
    <div className={`${baseClasses} ${show ? 'opacity-100' : 'opacity-0'}`}>
      {message}
    </div>
  );
};


const API_URL = 'https://glowing-spork-4j66qxx79pgvf4-3001.app.github.dev/api/transactions';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  
  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    getTransactions();
  }, []);

  const getTransactions = async () => {
    try {
      const response = await axios.get(API_URL);
      setTransactions(response.data);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    }
  };
  
  const addTransaction = async (e) => {
    e.preventDefault();
    if (!description || !amount) {
      showToast("Preencha todos os campos.", "error");
      return;
    }
    try {
      const newTransaction = { description, amount: Number(amount), type };
      await axios.post(API_URL, newTransaction);
      getTransactions();
      setDescription('');
      setAmount('');
      showToast("Transação adicionada com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      showToast("Erro ao adicionar transação.", "error");
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      getTransactions();
      showToast("Transação deletada.", "success");
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome + totalExpense;

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Toast message={toast.message} type={toast.type} show={toast.show} />
      <main className="container mx-auto p-4 md:p-8 max-w-3xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
          Gerenciador Financeiro
        </h1>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h4 className="text-lg font-semibold text-gray-600">Receitas</h4>
            <p className="text-2xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h4 className="text-lg font-semibold text-gray-600">Despesas</h4>
            <p className="text-2xl font-bold text-red-600">R$ {Math.abs(totalExpense).toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h4 className="text-lg font-semibold text-gray-600">Saldo</h4>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {balance.toFixed(2)}
            </p>
          </div>
        </div>

        {}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Adicionar Nova Transação</h3>
          <form onSubmit={addTransaction} className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
              <input type="text" id="description" placeholder="Ex: Salário" value={description} onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor</label>
                <input type="number" step="0.01" id="amount" placeholder="25.50" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
              </div>
              <div className="flex-1">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
                <select id="type" value={type} onChange={(e) => setType(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              Adicionar
            </button>
          </form>
        </div>

        {/* Histórico */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Histórico</h3>
          <div className="space-y-3">
            {transactions.map(t => (
              <div key={t._id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                <span className="font-semibold text-gray-700">{t.description}</span>
                <div className="flex items-center space-x-4">
                  <span className={`font-bold ${t.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                    {t.type === 'expense' ? '-' : '+'} R$ {Math.abs(t.amount).toFixed(2)}
                  </span>
                  <button onClick={() => deleteTransaction(t._id)} className="text-gray-400 hover:text-red-600 transition-colors" aria-label="Deletar">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;