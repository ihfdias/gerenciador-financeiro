const test = require('node:test');
const assert = require('node:assert/strict');

const { parseCookieHeader } = require('../utils/cookies');
const { CSRF_COOKIE_NAME } = require('../middleware/csrf');
const {
  buildDateRange,
  buildMonthRange,
  isValidEmail,
  parseDate,
  parseMoney,
  parsePositiveInteger,
  sanitizeEmail,
  sanitizeString,
} = require('../utils/validation');
const { generateSecureToken } = require('../utils/tokens');

test('parseCookieHeader parses multiple cookies', () => {
  assert.deepEqual(parseCookieHeader('a=1; financeiro_auth=abc123; theme=dark'), {
    a: '1',
    financeiro_auth: 'abc123',
    theme: 'dark',
  });
});

test('validation helpers sanitize and parse safely', () => {
  assert.equal(sanitizeString('  Igor  '), 'Igor');
  assert.equal(sanitizeEmail('  TESTE@EMAIL.COM '), 'teste@email.com');
  assert.equal(isValidEmail('teste@email.com'), true);
  assert.equal(parsePositiveInteger('12'), 12);
  assert.equal(parsePositiveInteger('0'), null);
  assert.equal(parseMoney('12.34'), 12.34);
  assert.equal(parseMoney('abc'), null);
  assert.ok(parseDate('2026-04-03'));
  assert.equal(parseDate('2026-04-03').toISOString(), '2026-04-03T12:00:00.000Z');
  assert.equal(parseDate('not-a-date'), null);
});

test('buildMonthRange returns stable UTC month boundaries', () => {
  assert.deepEqual(buildMonthRange(2026, 4), {
    startDate: new Date('2026-04-01T00:00:00.000Z'),
    endDate: new Date('2026-05-01T00:00:00.000Z'),
  });
  assert.equal(buildMonthRange(2026, 13), null);
});

test('buildDateRange returns inclusive UTC day boundaries', () => {
  assert.deepEqual(buildDateRange('2026-04-03', '2026-04-09'), {
    startDate: new Date('2026-04-03T00:00:00.000Z'),
    endDate: new Date('2026-04-10T00:00:00.000Z'),
  });
  assert.equal(buildDateRange('2026-04-10', '2026-04-09'), null);
  assert.equal(buildDateRange('invalid', '2026-04-09'), null);
});

test('generateSecureToken returns non-empty random tokens', () => {
  const first = generateSecureToken();
  const second = generateSecureToken();

  assert.equal(typeof first, 'string');
  assert.equal(first.length > 0, true);
  assert.notEqual(first, second);
});

test('parseCookieHeader can read csrf cookie', () => {
  const token = 'abc123';
  assert.equal(parseCookieHeader(`${CSRF_COOKIE_NAME}=${token}`)[CSRF_COOKIE_NAME], token);
});
