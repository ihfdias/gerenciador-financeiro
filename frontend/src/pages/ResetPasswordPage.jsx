import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';

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
      const res = await api.post(`/api/auth/reset-password/${id}/${token}`, { password });
      setMessage(res.data.msg);
      setTimeout(() => navigate('/login', { state: { message: 'Senha alterada com sucesso! Faça o login.' } }), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Link inválido ou expirado. Por favor, tente novamente.');
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-8">
      <div className="glass-panel section-reveal w-full max-w-lg p-6 md:p-8 lg:p-10">
        <span className="soft-label">Nova credencial</span>
        <h2 className="mt-3 text-4xl font-bold text-slate-50">Definir nova senha</h2>
        {message && <p className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-center text-sm text-emerald-200">{message}</p>}
        {error && <p className="mt-6 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3 text-center text-sm text-rose-200">{error}</p>}
        {!message && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Nova senha</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-shell" placeholder="Digite sua nova senha" required />
            </div>
            <button type="submit" className="primary-button w-full">Redefinir senha</button>
          </form>
        )}
         <p className="mt-6 text-center text-sm"><Link to="/login" className="text-slate-400 transition hover:text-slate-200">Voltar para o login</Link></p>
      </div>
    </div>
  );
}
export default ResetPasswordPage;
