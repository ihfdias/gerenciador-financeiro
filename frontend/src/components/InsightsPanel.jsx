import React from 'react';

function InsightsPanel({
  indicatorCards,
  isInsightLoading,
  forecast,
  formatSensitiveValue,
}) {
  return (
    <div>
      <section className="grid gap-6 lg:grid-cols-3">
        {indicatorCards.map((indicator) => (
          <article key={indicator.label} className="glass-card section-reveal p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{indicator.label}</p>
            <p className="mt-3 text-2xl font-semibold text-sky-200">
              {isInsightLoading ? 'Carregando...' : indicator.value !== null && indicator.value !== undefined ? indicator.format(indicator.value) : '--'}
            </p>
          </article>
        ))}
      </section>

      <article className="mt-6 glass-card section-reveal p-6">
        <p className="soft-label">Insight do mês</p>
        <h3 className="mt-3 text-2xl font-bold text-slate-50">Previsão de saldo no fim do mês</h3>
        {isInsightLoading || !forecast ? (
          <p className="mt-4 text-sm text-slate-300">Calculando projeção...</p>
        ) : (
          <>
            <p className="mt-4 text-sm text-slate-300">
              Com base no histórico recente e no ritmo atual ({forecast.inputs.elapsedDays}/{forecast.inputs.daysInMonth} dias), sua projeção é:
            </p>
            <p className="mt-4 text-3xl font-semibold text-sky-200">
              {formatSensitiveValue(forecast.projection.projectedEndBalance)}
            </p>
          </>
        )}
      </article>
    </div>
  );
}

export default InsightsPanel;
