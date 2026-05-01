import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/api/auth/register', { name, email, password });
      navigate('/login', { state: { message: 'Conta criada com sucesso! Faça o login.' } });
    } catch (err) {
      const apiMessage = err.response?.data?.msg;
      setError(apiMessage || 'Não foi possível criar sua conta agora. Tente novamente em instantes.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-8">
      <div className="glass-panel section-reveal w-full max-w-xl p-6 md:p-8 lg:p-10">
        <span className="soft-label">Primeiro acesso</span>
        <h2 className="mt-3 text-4xl font-bold text-slate-50">Criar conta</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">Monte seu espaço financeiro com uma base organizada desde o começo.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <p className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3 text-center text-sm text-rose-200">{error}</p>}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-shell"
              placeholder="Como você gostaria de ser chamado?"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-shell"
              placeholder="voce@email.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-shell"
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              maxLength={128}
              required
            />
          </div>

          <button type="submit" className="primary-button w-full disabled:opacity-60" disabled={isLoading}>
            {isLoading ? 'Criando conta...' : 'Criar minha conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Já tem uma conta? <Link to="/login" className="font-semibold text-sky-300 transition hover:text-sky-200">Faça login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
