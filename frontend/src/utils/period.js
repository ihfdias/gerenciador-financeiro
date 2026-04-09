export function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

export function getMonthDateRange(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  return {
    startDate: formatDateInput(start),
    endDate: formatDateInput(end),
  };
}

export function getYearDateRange(year) {
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
}

export function getPresetDateRange(presetKey, now = new Date()) {
  const end = formatDateInput(now);

  switch (presetKey) {
    case 'last7Days':
      return {
        startDate: formatDateInput(addDays(now, -6)),
        endDate: end,
      };
    case 'last30Days':
      return {
        startDate: formatDateInput(addDays(now, -29)),
        endDate: end,
      };
    case 'thisYear':
      return getYearDateRange(now.getFullYear());
    default:
      return null;
  }
}

export function buildPeriodQuery({ filterMode, selectedYear, selectedMonth, startDate, endDate }) {
  if (filterMode === 'range') {
    if (!startDate || !endDate) {
      return '';
    }

    return `startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
  }

  return `year=${selectedYear}&month=${selectedMonth}`;
}

export function isRangeReady(startDate, endDate) {
  return Boolean(startDate && endDate);
}

export function isRangeValid(startDate, endDate) {
  return isRangeReady(startDate, endDate) && startDate <= endDate;
}

export function formatPeriodLabel({
  filterMode,
  selectedYear,
  selectedMonth,
  startDate,
  endDate,
  locale = 'pt-BR',
}) {
  if (filterMode === 'range' && startDate && endDate) {
    const formatter = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });

    const start = new Date(`${startDate}T12:00:00Z`);
    const end = new Date(`${endDate}T12:00:00Z`);
    return `${formatter.format(start)} a ${formatter.format(end)}`;
  }

  return new Date(selectedYear, selectedMonth - 1, 1).toLocaleString(locale, {
    month: 'long',
    year: 'numeric',
  });
}
