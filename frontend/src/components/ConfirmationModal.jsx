import React from 'react';

function ConfirmationModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm mx-4">
        <h2 className="text-xl font-bold mb-4">Confirmar Ação</h2>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-danger text-white rounded-md hover:opacity-90">
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;