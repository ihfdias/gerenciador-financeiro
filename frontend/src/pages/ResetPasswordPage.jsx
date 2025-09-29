import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { id, token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password/${id}/${token}`, { password });
      setMessage(res.data.msg);
      setTimeout(() => navigate('/login', { state: { message: 'Senha alterada com sucesso! Faça o login.' } }), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Link inválido ou expirado. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Digite sua Nova Senha</h2>
        {message && <p className="text-center text-green-600 bg-green-100 p-3 rounded-md">{message}</p>}
        {error && <p className="text-center text-danger bg-red-100 p-3 rounded-md">{error}</p>}
        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-gray-700 font-medium">Nova Senha</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
            </div>
            <button type="submit" className="w-full bg-primary text-white py-2 rounded-md hover:opacity-90">Redefinir Senha</button>
          </form>
        )}
         <p className="mt-6 text-center"><Link to="/login" className="text-primary hover:underline">Voltar para o Login</Link></p>
      </div>
    </div>
  );
}
export default ResetPasswordPage;