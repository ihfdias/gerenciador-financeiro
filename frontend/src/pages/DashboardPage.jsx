import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function DashboardPage() { 
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  
  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  
  
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
      if (error.response && (error.response.status === 401 || error.response.status === 400)) {
        handleLogout();
      }
    }
  };
  
    useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login'); 
    } else {
      const decodedToken = jwtDecode(token);
      setUserName(decodedToken.name);
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
    <div className="min-h-screen font-sans">
       <header className="bg-white shadow-md">
        <nav className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <h1 className="text-lg md:text-xl font-bold text-gray-800">Meu Gerenciador</h1>
          <button onClick={handleLogout} className="bg-danger text-white px-3 py-2 md:px-4 text-sm md:text-base rounded-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger">
            Logout
          </button>
        </nav>
      </header>
      <main className="container mx-auto p-4 md:p-8 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
          Olá, <span className="text-primary">{userName}!</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h4 className="text-base md:text-lg font-semibold text-gray-600">Receitas</h4>
            <p className="text-xl md:text-2xl font-bold text-success">{currencyFormatter.format(totalIncome)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h4 className="text-base md:text-lg font-semibold text-gray-600">Despesas</h4>
            <p className="text-xl md:text-2xl font-bold text-danger">{currencyFormatter.format(Math.abs(totalExpense))}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h4 className="text-base md:text-lg font-semibold text-gray-600">Saldo</h4>
            <p className={`text-xl md:text-2xl font-bold ${balance >= 0 ? 'text-primary' : 'text-danger'}`}>
              {currencyFormatter.format(balance)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Adicionar Nova Transação</h3>
          <form onSubmit={addTransaction} className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
              <input type="text" id="description" placeholder="Ex: Salário, Aluguel" value={description} onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor</label>
                <input type="number" step="0.01" id="amount" placeholder="25.50" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
              </div>
              <div className="flex-1">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
                <select id="type" value={type} onChange={(e) => setType(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
              Adicionar
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Histórico</h3>
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map(t => (
                <div key={t._id} className="bg-white p-3 md:p-4 rounded-lg shadow-md flex justify-between items-center">
                  <span className="font-semibold text-sm md:text-base text-gray-700">{t.description}</span>
                  <div className="flex items-center space-x-2 md:space-x-4">
                    <span className={`font-bold text-sm md:text-base ${t.amount < 0 ? 'text-danger' : 'text-success'}`}>
                      {currencyFormatter.format(t.amount)}
                    </span>
                    <button onClick={() => deleteTransaction(t._id)} className="text-gray-400 hover:text-danger transition-colors" aria-label="Deletar">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Nenhuma transação encontrada.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;