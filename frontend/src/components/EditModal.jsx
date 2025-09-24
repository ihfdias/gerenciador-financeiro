import React, { useState, useEffect } from 'react';

const categories = ["Salário", "Comida", "Transporte", "Moradia", "Lazer", "Saúde", "Educação", "Investimentos", "Outros"];


const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

function EditModal({ isOpen, onClose, transaction, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: Math.abs(transaction.amount),
        type: transaction.type,
        category: transaction.category,
        date: formatDateForInput(transaction.date) 
      });
    }
  }, [transaction]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-4">Editar Transação</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <input type="text" name="description" value={formData.description || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
          </div>
          {}
          <div>
            <label className="block text-sm font-medium text-gray-700">Data</label>
            <input type="date" name="date" value={formData.date || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoria</label>
            <select name="category" value={formData.category || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Valor</label>
              <input type="number" name="amount" step="0.01" value={formData.amount || 0} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select name="type" value={formData.type || 'income'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditModal;