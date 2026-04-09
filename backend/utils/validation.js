const mongoose = require('mongoose');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

function sanitizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeEmail(value) {
  return sanitizeString(value).toLowerCase();
}

function isValidEmail(value) {
  return EMAIL_REGEX.test(sanitizeEmail(value));
}

function parsePositiveInteger(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseMoney(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    const match = value.match(DATE_ONLY_REGEX);

    if (match) {
      const [, year, month, day] = match;
      const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0));
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildMonthRange(year, month) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return {
    startDate: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)),
    endDate: new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)),
  };
}

function buildDateRange(startDateValue, endDateValue) {
  if (typeof startDateValue !== 'string' || typeof endDateValue !== 'string') {
    return null;
  }

  const startMatch = startDateValue.match(DATE_ONLY_REGEX);
  const endMatch = endDateValue.match(DATE_ONLY_REGEX);

  if (!startMatch || !endMatch) {
    return null;
  }

  const [, startYear, startMonth, startDay] = startMatch;
  const [, endYear, endMonth, endDay] = endMatch;

  const startDate = new Date(Date.UTC(Number(startYear), Number(startMonth) - 1, Number(startDay), 0, 0, 0, 0));
  const inclusiveEndDate = new Date(Date.UTC(Number(endYear), Number(endMonth) - 1, Number(endDay), 0, 0, 0, 0));

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(inclusiveEndDate.getTime())) {
    return null;
  }

  if (startDate > inclusiveEndDate) {
    return null;
  }

  const endDate = new Date(inclusiveEndDate);
  endDate.setUTCDate(endDate.getUTCDate() + 1);

  return { startDate, endDate };
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

module.exports = {
  buildDateRange,
  buildMonthRange,
  isValidEmail,
  isValidObjectId,
  parseDate,
  parseMoney,
  parsePositiveInteger,
  sanitizeEmail,
  sanitizeString,
};
