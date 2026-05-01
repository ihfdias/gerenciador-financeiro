const DEFAULT_CACHE_TTL_MS = Number.parseInt(process.env.INDICATORS_CACHE_TTL_MS || '', 10) || 10 * 60 * 1000;

const cache = {
  value: null,
  expiresAt: 0,
};

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

async function fetchDolarRate() {
  const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
  if (!response.ok) {
    throw new Error('Falha ao consultar cotacao do dolar.');
  }

  const data = await response.json();
  const usdBrl = data?.USDBRL;

  return {
    value: safeNumber(usdBrl?.bid),
    updatedAt: usdBrl?.create_date,
    source: 'awesomeapi',
  };
}

async function fetchBcbSerie(codigoSerie) {
  const response = await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigoSerie}/dados/ultimos/1?formato=json`);
  if (!response.ok) {
    throw new Error(`Falha ao consultar serie ${codigoSerie}.`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Serie ${codigoSerie} sem dados.`);
  }

  const latest = data[data.length - 1];
  const numericValue = safeNumber((latest?.valor || '').toString().replace(',', '.'));

  return {
    value: numericValue,
    date: latest?.data || null,
  };
}

async function fetchIndicatorsFromSources() {
  const [dolar, selic, ipca] = await Promise.all([
    fetchDolarRate(),
    fetchBcbSerie(432),
    fetchBcbSerie(433),
  ]);

  return {
    dolar,
    selic: { ...selic, source: 'bcb_sgs' },
    ipca: { ...ipca, source: 'bcb_sgs' },
    fetchedAt: new Date().toISOString(),
  };
}

async function getFinancialIndicators({ forceRefresh = false } = {}) {
  const now = Date.now();

  if (!forceRefresh && cache.value && cache.expiresAt > now) {
    return {
      ...cache.value,
      cache: {
        hit: true,
        expiresAt: new Date(cache.expiresAt).toISOString(),
        ttlMs: DEFAULT_CACHE_TTL_MS,
      },
    };
  }

  const freshValue = await fetchIndicatorsFromSources();
  cache.value = freshValue;
  cache.expiresAt = now + DEFAULT_CACHE_TTL_MS;

  return {
    ...freshValue,
    cache: {
      hit: false,
      expiresAt: new Date(cache.expiresAt).toISOString(),
      ttlMs: DEFAULT_CACHE_TTL_MS,
    },
  };
}

module.exports = {
  getFinancialIndicators,
};
