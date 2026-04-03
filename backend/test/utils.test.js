const test = require('node:test');
const assert = require('node:assert/strict');

const { parseCookieHeader } = require('../utils/cookies');
const { CSRF_COOKIE_NAME } = require('../middleware/csrf');
const {
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
  assert.equal(parseDate('not-a-date'), null);
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
