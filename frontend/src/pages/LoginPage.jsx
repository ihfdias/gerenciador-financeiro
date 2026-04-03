import React, { useState } from 'react';
import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  const { isAuthenticated, login } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Email ou senha inválidos.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="glass-panel section-reveal hidden min-h-[680px] overflow-hidden p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <span className="soft-label">Planejamento financeiro elegante</span>
            <h1 className="hero-title mt-5 max-w-xl text-slate-50">
              Uma visão mais calma e inteligente da sua vida financeira.
            </h1>
            <p className="hero-copy mt-6 max-w-lg">
              Organize receitas, despesas e decisões com uma interface refinada, clara e pronta para o dia a dia.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass-card elevated-hover p-5">
              <p className="soft-label">Experiência</p>
              <p className="mt-3 text-2xl font-semibold text-slate-50">Fluxo simples</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">Tudo o que você precisa para registrar, revisar e ajustar sem fricção.</p>
            </div>
            <div className="glass-card elevated-hover p-5">
              <p className="soft-label">Clareza</p>
              <p className="mt-3 text-2xl font-semibold text-slate-50">Insight rápido</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">Visual limpo para entender o mês em segundos e agir com confiança.</p>
            </div>
          </div>
        </section>

        <section className="glass-panel section-reveal w-full p-6 md:p-8 lg:p-10">
          <div className="mb-8">
            <span className="soft-label">Acesso seguro</span>
            <h2 className="mt-3 text-4xl font-bold text-slate-50">Entrar</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">Volte para seu painel e acompanhe seu dinheiro com mais leveza.</p>
          </div>

          {successMessage && <p className="mb-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-center text-sm text-emerald-200">{successMessage}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3 text-center text-sm text-rose-200">{error}</p>}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-shell" placeholder="voce@email.com" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-shell" placeholder="Sua senha" required />
            </div>
            <button
              type="submit"
              className="primary-button w-full disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : 'Entrar no painel'}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm">
            <p className="text-slate-400">
              Não tem uma conta? <Link to="/register" className="font-semibold text-sky-300 transition hover:text-sky-200">Crie uma</Link>
            </p>
            <p>
              <Link to="/forgot-password" className="text-slate-400 transition hover:text-slate-200">Esqueceu sua senha?</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
