import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setMessage(res.data.msg);
    } catch {
      setMessage('Ocorreu um erro. Tente novamente mais tarde.');
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-8">
      <div className="glass-panel section-reveal w-full max-w-lg p-6 md:p-8 lg:p-10">
        <span className="soft-label">Recuperação</span>
        <h2 className="mt-3 text-4xl font-bold text-slate-50">Recuperar senha</h2>
        {message ? (
          <p className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-center text-sm text-emerald-200">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <p className="text-sm leading-7 text-slate-300">Digite seu email e, se ele estiver cadastrado, enviaremos um link para redefinir sua senha.</p>
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-shell" placeholder="voce@email.com" required />
            </div>
            <button type="submit" className="primary-button w-full">Enviar link de recuperação</button>
          </form>
        )}
        <p className="mt-6 text-center text-sm"><Link to="/login" className="text-slate-400 transition hover:text-slate-200">Voltar para o login</Link></p>
      </div>
    </div>
  );
}
export default ForgotPasswordPage;
