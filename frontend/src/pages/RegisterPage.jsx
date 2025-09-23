import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true); 
  setError(''); 
  try {
    await axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password });
    localStorage.setItem('token', response.data.token);
    navigate('/');
  } catch (err) {
    setError('Email ou senha inválidos.');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Criar Conta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-danger text-center mb-4">{error}</p>}

          { }
          <div>
            <label className="block text-gray-700 font-medium">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:opacity-90 flex justify-center items-center disabled:opacity-50"
            disabled={isLoading} 
          >
            {isLoading ? <Spinner /> : 'Registrar'}
          </button>
        </form>
        <p className="mt-6 text-center">
          Já tem uma conta? <Link to="/login" className="text-primary hover:underline">Faça login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;