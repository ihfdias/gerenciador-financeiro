import React from 'react';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ExportActions from './ExportActions';

function TrendChartCard({
  balanceTrend,
  isPrivacyMode,
  formatSensitiveValue,
  isExportingCsv,
  isExportingPdf,
  onExportCsv,
  onExportPdf,
}) {
  return (
    <article className="glass-card section-reveal p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="soft-label">Tendência</p>
          <h3 className="mt-3 text-2xl font-bold text-slate-50">Saldo acumulado (6 meses)</h3>
        </div>
        <ExportActions
          isExportingCsv={isExportingCsv}
          isExportingPdf={isExportingPdf}
          onExportCsv={onExportCsv}
          onExportPdf={onExportPdf}
        />
      </div>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={balanceTrend}>
            <defs>
              <linearGradient id="saldoGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#94a3b8" />
            <YAxis
              stroke="#94a3b8"
              tickFormatter={(value) => (isPrivacyMode ? '••••' : Number(value).toLocaleString('pt-BR', { notation: 'compact' }))}
            />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value) => [formatSensitiveValue(Number(value)), 'Saldo acumulado']}
            />
            <Area type="monotone" dataKey="accumulatedBalance" stroke="#38bdf8" strokeWidth={2.5} fill="url(#saldoGlow)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export default TrendChartCard;
