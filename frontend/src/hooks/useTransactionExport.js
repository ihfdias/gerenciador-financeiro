import { useState } from 'react';
import api from '../lib/api';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const exportColumns = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (BRL)'];

function buildCsv(rows) {
  const escapeValue = (input) => `"${String(input ?? '').replaceAll('"', '""')}"`;
  const lines = [exportColumns.map(escapeValue).join(',')];
  rows.forEach((row) => {
    lines.push([
      new Date(row.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
      row.description,
      row.category,
      row.type === 'income' ? 'Receita' : 'Despesa',
      Number(row.amount).toFixed(2).replace('.', ','),
    ].map(escapeValue).join(','));
  });
  return `${lines.join('\n')}\n`;
}

export function useTransactionExport() {
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const loadFilteredTransactions = async (historyQueryString) => {
    const exportParams = new URLSearchParams(historyQueryString);
    exportParams.delete('page');
    exportParams.delete('limit');
    const response = await api.get(`/api/transactions?${exportParams.toString()}`);
    return Array.isArray(response.data) ? response.data : [];
  };

  const exportTransactionsCsv = async (historyQueryString) => {
    setIsExportingCsv(true);
    try {
      const rows = await loadFilteredTransactions(historyQueryString);
      const chunkSize = 1200;
      const chunks = [];

      for (let i = 0; i < rows.length; i += chunkSize) {
        chunks.push(rows.slice(i, i + chunkSize));
      }

      const csvParts = [];
      for (let i = 0; i < chunks.length; i += 1) {
        const part = buildCsv(chunks[i]);
        csvParts.push(i === 0 ? part : part.split('\n').slice(1).join('\n'));
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      }

      const blob = new Blob(csvParts, { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-flow-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    } finally {
      setIsExportingCsv(false);
    }
  };

  const exportTransactionsPdf = async (historyQueryString) => {
    setIsExportingPdf(true);
    try {
      const rows = await loadFilteredTransactions(historyQueryString);
      const htmlRows = rows.map((row) => `
        <tr>
          <td>${escapeHtml(new Date(row.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }))}</td>
          <td>${escapeHtml(row.description)}</td>
          <td>${escapeHtml(row.category)}</td>
          <td>${row.type === 'income' ? 'Receita' : 'Despesa'}</td>
          <td style="text-align:right">${escapeHtml(Number(row.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))}</td>
        </tr>
      `).join('');

      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (!printWindow) {
        throw new Error('Não foi possível abrir a janela de impressão.');
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Finance Flow - Exportação</title>
            <style>
              body { font-family: sans-serif; padding: 24px; color: #0f172a; }
              h1 { margin-bottom: 6px; }
              p { margin-top: 0; color: #475569; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; }
              th { background: #e2e8f0; text-align: left; }
            </style>
          </head>
          <body>
            <h1>Finance Flow - Transações filtradas</h1>
            <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
            <table>
              <thead>
                <tr>
                  ${exportColumns.map((column) => `<th>${column}</th>`).join('')}
                </tr>
              </thead>
              <tbody>${htmlRows}</tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return {
    exportTransactionsCsv,
    exportTransactionsPdf,
    isExportingCsv,
    isExportingPdf,
  };
}
