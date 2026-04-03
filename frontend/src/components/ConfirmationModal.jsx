import React from 'react';

function ConfirmationModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 backdrop-blur-md">
      <div className="glass-panel w-full max-w-sm p-6">
        <span className="soft-label">Confirmar ação</span>
        <h2 className="mt-3 text-2xl font-bold text-slate-50">Excluir transação?</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">{message}</p>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="secondary-button">
            Cancelar
          </button>
          <button onClick={onConfirm} className="rounded-2xl bg-rose-400 px-5 py-3 font-semibold text-rose-950 transition hover:bg-rose-300">
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
