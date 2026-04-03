function createRateLimiter({ windowMs, maxRequests, message }) {
  const requests = new Map();

  return function rateLimiter(req, res, next) {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const entry = requests.get(key);

    if (!entry || entry.resetAt <= now) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ msg: message });
    }

    entry.count += 1;
    return next();
  };
}

module.exports = createRateLimiter;
