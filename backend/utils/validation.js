const mongoose = require('mongoose');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

module.exports = {
  isValidEmail,
  isValidObjectId,
  parseDate,
  parseMoney,
  parsePositiveInteger,
  sanitizeEmail,
  sanitizeString,
};
