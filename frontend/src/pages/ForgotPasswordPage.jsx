import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.msg);
    } catch (err) {
      setMessage('Ocorreu um erro. Tente novamente mais tarde.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Recuperar Senha</h2>
        {message ? (
          <p className="text-center text-green-600 bg-green-100 p-3 rounded-md">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-center text-gray-600">Digite seu email e, se ele estiver cadastrado, enviaremos um link para redefinir sua senha.</p>
            <div>
                <label className="block text-gray-700 font-medium">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
            </div>
            <button type="submit" className="w-full bg-primary text-white py-2 rounded-md hover:opacity-90">Enviar Link de Recuperação</button>
          </form>
        )}
        <p className="mt-6 text-center"><Link to="/login" className="text-primary hover:underline">Voltar para o Login</Link></p>
      </div>
    </div>
  );
}
export default ForgotPasswordPage;