import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const navigate = useNavigate();
  
  const getToken = () => localStorage.getItem('token');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getTransactions = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      if (error.response && error.response.status === 401) {
        handleLogout(); 
      }
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login'); 
    } else {
      getTransactions();
    }
  }, []);
  
  const addTransaction = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const newTransaction = { description, amount: Number(amount), type };
      await axios.post(`${API_BASE_URL}/api/transactions`, newTransaction, {
        headers: { Authorization: `Bearer ${token}` }
      });
      getTransactions();
      setDescription('');
      setAmount('');
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const token = getToken();
      await axios.delete(`${API_BASE_URL}/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      getTransactions();
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome + totalExpense;

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
       <header className="bg-white shadow-md">
        <nav className="container mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Meu Gerenciador</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Logout
          </button>
        </nav>
      </header>
      <main className="container mx-auto p-4 md:p-8 max-w-3xl">
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

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Adicionar Nova Transação</h3>
          <form onSubmit={addTransaction} className="space-y-4">{/* ... o formulário ... */}</form>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Histórico</h3>
          <div className="space-y-3">
            {transactions.map(t => (
              <div key={t._id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">{/* ... o item da lista ... */}</div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;