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

  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const getToken = () => localStorage.getItem('token');
  const handleLogout = () => {};
 
  const getTransactions = async (year, month) => {
    try {
      const token = getToken();
      let url = `${API_BASE_URL}/api/transactions`;
            
      if (year && month) {
        url += `?year=${year}&month=${month}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
       
    }
  };  
  
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login'); 
    } else {
      const decodedToken = jwtDecode(token);
      setUserName(decodedToken.name);      
      getTransactions(selectedYear, selectedMonth);
    }
  }, [selectedYear, selectedMonth]); 
  
  const addTransaction = async (e) => { };
  const deleteTransaction = async (id) => {};

  const handleFilterChange = (year, month) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };
  
  const clearFilters = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
    getTransactions(currentYear, currentMonth);
  };

  const totalIncome = transactions.reduce((acc, t) => (t.type === 'income' ? acc + t.amount : acc), 0);
  const totalExpense = transactions.reduce((acc, t) => (t.type === 'expense' ? acc + t.amount : acc), 0);
  const balance = totalIncome + totalExpense;  
  
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString('pt-BR', { month: 'long' })
  }));

  return (
    <div className="bg-background min-h-screen font-sans">
       {}
      <main className="container mx-auto p-4 md:p-8 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
          Olá, <span className="text-primary">{userName}!</span>
        </h2>
        
        {}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row items-center gap-4">
            <span className="font-semibold">Filtrar por:</span>
            <div className="flex gap-4">
                <select value={selectedMonth} onChange={(e) => handleFilterChange(selectedYear, e.target.value)} className="border border-gray-300 rounded-md p-2">
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select value={selectedYear} onChange={(e) => handleFilterChange(e.target.value, selectedMonth)} className="border border-gray-300 rounded-md p-2">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            <button onClick={clearFilters} className="text-primary hover:underline ml-auto">Limpar</button>
        </div>

        {}
      </main>
    </div>
  );
}

export default DashboardPage;