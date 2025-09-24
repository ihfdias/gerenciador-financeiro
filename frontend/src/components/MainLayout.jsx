import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
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
          <h1 className="text-lg md:text-xl font-bold text-gray-800 cursor-pointer" onClick={() => navigate('/')}>
            Meu Gerenciador
          </h1>
          {}
          <button onClick={handleLogout} className="bg-danger text-white px-3 py-2 md:px-4 text-sm md:text-base rounded-md hover:opacity-90">
            Logout
          </button>
        </nav>
      </header>

      <main className="flex-grow">
        <Outlet /> {}
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;