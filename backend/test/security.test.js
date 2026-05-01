const test = require('node:test');
const assert = require('node:assert/strict');

// ── accountLockout ────────────────────────────────────────────────────────────

const { checkLockout, recordFailure, clearFailures } = require('../middleware/accountLockout');

test('accountLockout: not locked on first failure', () => {
  const email = `test-${Date.now()}@example.com`;
  recordFailure(email);
  assert.equal(checkLockout(email).locked, false);
  clearFailures(email);
});

test('accountLockout: locks after 5 consecutive failures', () => {
  const email = `lockout-${Date.now()}@example.com`;
  for (let i = 0; i < 5; i++) recordFailure(email);
  const result = checkLockout(email);
  assert.equal(result.locked, true);
  assert.ok(result.retryAfter > 0, 'retryAfter should be positive');
  clearFailures(email);
});

test('accountLockout: clearFailures removes the lock', () => {
  const email = `clear-${Date.now()}@example.com`;
  for (let i = 0; i < 5; i++) recordFailure(email);
  assert.equal(checkLockout(email).locked, true);
  clearFailures(email);
  assert.equal(checkLockout(email).locked, false);
});

test('accountLockout: different emails are independent', () => {
  const emailA = `a-${Date.now()}@example.com`;
  const emailB = `b-${Date.now()}@example.com`;
  for (let i = 0; i < 5; i++) recordFailure(emailA);
  assert.equal(checkLockout(emailA).locked, true);
  assert.equal(checkLockout(emailB).locked, false);
  clearFailures(emailA);
});

// ── logger ────────────────────────────────────────────────────────────────────

const { requestLogger, logSecurityEvent } = require('../middleware/logger');

test('logger: requestLogger is a function (middleware shape)', () => {
  assert.equal(typeof requestLogger, 'function');
  assert.equal(requestLogger.length, 3); // (req, res, next)
});

test('logger: logSecurityEvent does not throw', () => {
  assert.doesNotThrow(() => logSecurityEvent('test_event', { ip: '127.0.0.1' }));
  assert.doesNotThrow(() => logSecurityEvent('test_event'));
});

test('logger: requestLogger calls next()', (_, done) => {
  const req = { method: 'GET', path: '/test', ip: '127.0.0.1', user: null };
  const res = { statusCode: 200, on: (event, cb) => { if (event === 'finish') cb(); } };
  requestLogger(req, res, done);
});

// ── rateLimit ─────────────────────────────────────────────────────────────────

const createRateLimiter = require('../middleware/rateLimit');

test('rateLimit: allows requests under the limit', () => {
  const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 3, message: 'blocked' });
  const req = { ip: `ip-${Date.now()}`, baseUrl: '/test', path: '/' };
  let nextCalls = 0;
  const next = () => { nextCalls++; };
  const res = { set: () => {}, status: () => ({ json: () => {} }) };

  limiter(req, res, next);
  limiter(req, res, next);
  limiter(req, res, next);
  assert.equal(nextCalls, 3);
});

test('rateLimit: blocks requests over the limit and sets Retry-After', () => {
  const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 2, message: 'blocked' });
  const req = { ip: `ip2-${Date.now()}`, baseUrl: '/test', path: '/' };
  let blocked = false;
  let retryAfterHeader = null;
  const res = {
    set: (key, val) => { if (key === 'Retry-After') retryAfterHeader = val; },
    status: (code) => ({ json: () => { if (code === 429) blocked = true; } }),
  };
  const next = () => {};

  limiter(req, res, next); // 1
  limiter(req, res, next); // 2
  limiter(req, res, next); // 3 → should block
  assert.equal(blocked, true);
  assert.ok(retryAfterHeader !== null, 'Retry-After header should be set');
});

// ── tokens ────────────────────────────────────────────────────────────────────

const { generateSecureToken } = require('../utils/tokens');
const crypto = require('node:crypto');

test('generateSecureToken: produces 64-char hex by default (32 bytes)', () => {
  const token = generateSecureToken();
  assert.equal(token.length, 64);
  assert.match(token, /^[0-9a-f]+$/);
});

test('generateSecureToken: produces 80-char hex for size=40', () => {
  const token = generateSecureToken(40);
  assert.equal(token.length, 80);
});

test('generateSecureToken: sha256 hash round-trip is deterministic', () => {
  const token = generateSecureToken(40);
  const hash1 = crypto.createHash('sha256').update(token).digest('hex');
  const hash2 = crypto.createHash('sha256').update(token).digest('hex');
  assert.equal(hash1, hash2);
  assert.notEqual(hash1, token);
});
