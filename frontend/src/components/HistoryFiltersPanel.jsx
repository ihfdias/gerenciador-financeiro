import React from 'react';

function HistoryFiltersPanel({
  categories,
  searchTerm,
  debouncedSearchTerm,
  historyTypeFilter,
  historyCategoryFilter,
  historySortOrder,
  historyPagination,
  currentItemsCount,
  pageIncome,
  pageExpense,
  currencyFormatter,
  onSearchChange,
  onTypeChange,
  onCategoryChange,
  onSortChange,
  onClear,
}) {
  return (
    <div className="glass-card p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-100">Refine o histórico</p>
            <p className="mt-1 text-sm text-slate-400">
              Busque lançamentos específicos e ajuste a visualização sem sair do período atual.
            </p>
          </div>
          <button type="button" onClick={onClear} className="secondary-button w-full text-sm lg:w-auto">
            Limpar filtros
          </button>
        </div>

        <div className="grid gap-3">
          <div className="min-w-0">
            <label htmlFor="historySearch" className="mb-2 block text-sm font-medium text-slate-200">Buscar no histórico</label>
            <input
              id="historySearch"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-shell"
              placeholder="Descrição ou categoria"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="min-w-0">
              <label htmlFor="historyTypeFilter" className="mb-2 block text-sm font-medium text-slate-200">Tipo</label>
              <select
                id="historyTypeFilter"
                value={historyTypeFilter}
                onChange={(e) => onTypeChange(e.target.value)}
                className="input-shell min-w-0"
              >
                <option value="all">Todos</option>
                <option value="income">Receitas</option>
                <option value="expense">Despesas</option>
              </select>
            </div>
            <div className="min-w-0">
              <label htmlFor="historyCategoryFilter" className="mb-2 block text-sm font-medium text-slate-200">Categoria</label>
              <select
                id="historyCategoryFilter"
                value={historyCategoryFilter}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="input-shell min-w-0"
              >
                <option value="all">Todas</option>
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label htmlFor="historySortOrder" className="mb-2 block text-sm font-medium text-slate-200">Ordenar por</label>
              <select
                id="historySortOrder"
                value={historySortOrder}
                onChange={(e) => onSortChange(e.target.value)}
                className="input-shell min-w-0"
              >
                <option value="date_desc">Mais recentes</option>
                <option value="date_asc">Mais antigas</option>
                <option value="amount_desc">Maior valor</option>
                <option value="amount_asc">Menor valor</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>
          {searchTerm !== debouncedSearchTerm
            ? 'Atualizando busca...'
            : `Mostrando ${currentItemsCount} item(ns) nesta página de ${historyPagination.totalItems} resultado(s).`}
        </p>
        <p className="flex flex-wrap gap-4">
          <span>Receitas na página: <span className="font-medium text-emerald-300">{currencyFormatter.format(pageIncome)}</span></span>
          <span>Despesas na página: <span className="font-medium text-rose-300">{currencyFormatter.format(pageExpense)}</span></span>
        </p>
      </div>
    </div>
  );
}

export default HistoryFiltersPanel;
