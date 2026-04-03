import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import Footer from './Footer';
import { useAuth } from '../hooks/useAuth';

function MainLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <header className="px-4 pt-4 md:px-8 md:pt-6">
        <nav className="glass-panel section-reveal mx-auto flex max-w-6xl flex-col gap-5 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-300/15 text-sky-200 shadow-glow">
                <span className="text-lg font-black">F</span>
              </div>
              <div>
                <p className="text-base font-semibold text-slate-50 md:text-lg">Finance Flow</p>
                <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">Controle pessoal</p>
              </div>
            </Link>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 p-1 text-sm text-slate-300">
              <Link to="/" className="rounded-xl px-4 py-2 transition hover:bg-white/5 hover:text-white">
                Painel
              </Link>
              <Link to="/analytics" className="rounded-xl px-4 py-2 transition hover:bg-white/5 hover:text-white">
                Insights
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-slate-100">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-slate-400">Bem-vindo de volta</p>
              </div>
              <button onClick={handleLogout} className="secondary-button px-4 py-2.5 text-sm">
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
