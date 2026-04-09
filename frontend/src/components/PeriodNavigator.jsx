import React from 'react';

function PeriodNavigator({
  filterMode = 'month',
  onModeChange,
  months,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onPrevious,
  onNext,
  onReset,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  presets = [],
  onPresetSelect,
  activePreset,
  rangeError,
  resetLabel = 'Voltar para o mês atual',
}) {
  return (
    <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="flex flex-col gap-4">
        <div className="inline-flex w-fit rounded-2xl border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => onModeChange?.('month')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${filterMode === 'month' ? 'bg-sky-300/15 text-sky-100' : 'text-slate-300 hover:text-white'}`}
          >
            Por mês
          </button>
          <button
            type="button"
            onClick={() => onModeChange?.('range')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${filterMode === 'range' ? 'bg-sky-300/15 text-sky-100' : 'text-slate-300 hover:text-white'}`}
          >
            Intervalo
          </button>
        </div>

        {filterMode === 'month' ? (
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={onPrevious} className="secondary-button px-4 py-3 text-sm">
              Mes anterior
            </button>
            <select value={selectedMonth} onChange={(e) => onMonthChange(e.target.value)} className="input-shell min-w-[180px]">
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label.charAt(0).toUpperCase() + month.label.slice(1)}
                </option>
              ))}
            </select>
            <select value={selectedYear} onChange={(e) => onYearChange(e.target.value)} className="input-shell min-w-[140px]">
              {Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button type="button" onClick={onNext} className="secondary-button px-4 py-3 text-sm">
              Proximo mes
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => onPresetSelect?.(preset.value)}
                  className={`px-4 py-2 text-sm ${activePreset === preset.value ? 'primary-button shadow-none' : 'secondary-button'}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm text-slate-300">
                <span className="mb-2 block font-medium text-slate-200">Data inicial</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange?.(e.target.value)}
                  className="input-shell"
                />
              </label>
              <label className="text-sm text-slate-300">
                <span className="mb-2 block font-medium text-slate-200">Data final</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange?.(e.target.value)}
                  className="input-shell"
                />
              </label>
            </div>
          </>
        )}
        {filterMode === 'range' && rangeError ? (
          <p className="text-sm text-rose-300">{rangeError}</p>
        ) : null}
      </div>
      <button type="button" onClick={onReset} className="secondary-button text-sm">
        {resetLabel}
      </button>
    </div>
  );
}

export default PeriodNavigator;
