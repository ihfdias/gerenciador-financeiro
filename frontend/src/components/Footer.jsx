import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-14 px-4 pb-8 md:px-8">
      <div className="glass-card mx-auto max-w-6xl px-6 py-5 text-sm text-slate-300">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-100">Gerenciador Financeiro</p>
            <p className="mt-1 text-slate-400">&copy; {currentYear}. Planejamento com mais clareza e menos atrito.</p>
          </div>
          <p className="text-slate-400">
            Desenvolvido por <a href="https://github.com/ihfdias" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-300 transition hover:text-sky-200">
              Igor Dias
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
