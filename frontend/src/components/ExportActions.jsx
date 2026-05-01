import React from 'react';

function ExportActions({
  isExportingCsv,
  isExportingPdf,
  onExportCsv,
  onExportPdf,
}) {
  return (
    <div className="flex gap-2">
      <button type="button" onClick={onExportCsv} disabled={isExportingCsv} className="secondary-button text-xs disabled:opacity-60">
        {isExportingCsv ? 'Exportando CSV...' : 'Exportar CSV'}
      </button>
      <button type="button" onClick={onExportPdf} disabled={isExportingPdf} className="secondary-button text-xs disabled:opacity-60">
        {isExportingPdf ? 'Exportando PDF...' : 'Exportar PDF'}
      </button>
    </div>
  );
}

export default ExportActions;
