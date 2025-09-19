import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function LoginPage() {  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      setError('Email ou senha inválidos.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        
        {}
        {successMessage && <p className="text-green-500 bg-green-100 p-3 rounded-md text-center mb-4">{successMessage}</p>}
        
        <form onSubmit={handleSubmit}>
          {}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
            Entrar
          </button>
        </form>
        <p className="mt-4 text-center">
          Não tem uma conta? <Link to="/register" className="text-indigo-600 hover:underline">Crie uma</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;