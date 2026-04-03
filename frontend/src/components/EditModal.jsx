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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl p-6 md:p-8">
        <span className="soft-label">Atualizar registro</span>
        <h2 className="mt-3 text-3xl font-bold text-slate-50">Editar transação</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Descrição</label>
            <input type="text" name="description" value={formData.description || ''} onChange={handleChange} className="input-shell" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Data</label>
            <input type="date" name="date" value={formData.date || ''} onChange={handleChange} className="input-shell" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Categoria</label>
            <select name="category" value={formData.category || ''} onChange={handleChange} className="input-shell">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-slate-200">Valor</label>
              <input type="number" name="amount" step="0.01" value={formData.amount || 0} onChange={handleChange} className="input-shell" required />
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-slate-200">Tipo</label>
              <select name="type" value={formData.type || 'income'} onChange={handleChange} className="input-shell">
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="secondary-button">
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditModal;
