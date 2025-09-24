import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full bg-white shadow-inner mt-12 py-6">
      <div className="container mx-auto text-center text-gray-600">
        <p>&copy; {currentYear} Gerenciador Financeiro. Todos os direitos reservados.</p>
        <p className="mt-2">
          Desenvolvido por <a href="https://github.com/ihfdias" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Igor Dias</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;