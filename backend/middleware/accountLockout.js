const MAX_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const attempts = new Map();

const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of attempts.entries()) {
    if (!entry.lockedUntil || entry.lockedUntil <= now) {
      attempts.delete(email);
    }
  }
}, LOCKOUT_MS);
if (cleanup.unref) cleanup.unref();

function checkLockout(email) {
  const entry = attempts.get(email);
  if (!entry?.lockedUntil) return { locked: false };

  const now = Date.now();
  if (entry.lockedUntil > now) {
    return { locked: true, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
  }

  attempts.delete(email);
  return { locked: false };
}

function recordFailure(email) {
  const entry = attempts.get(email) || { count: 0, lockedUntil: null };
  entry.count += 1;

  if (entry.count >= MAX_FAILURES) {
    entry.lockedUntil = Date.now() + LOCKOUT_MS;
    entry.count = 0;
  }

  attempts.set(email, entry);
}

function clearFailures(email) {
  attempts.delete(email);
}

module.exports = { checkLockout, recordFailure, clearFailures };
