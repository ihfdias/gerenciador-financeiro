import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import Footer from './Footer';

function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="bg-background min-h-screen font-sans flex flex-col">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg md:text-xl font-bold text-gray-800">
              Meu Gerenciador
            </Link>
            <Link to="/analytics" className="text-sm md:text-base text-gray-600 hover:text-primary">
              Análise Mensal
            </Link>
          </div>
          <button onClick={handleLogout} className="...">
            Logout
          </button>
        </nav>
      </header>

      <main className="flex-grow">
        <Outlet /> { }
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;