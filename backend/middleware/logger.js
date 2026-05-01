function formatLog(level, event, details) {
  process.stdout.write(JSON.stringify({ ts: new Date().toISOString(), level, event, ...details }) + '\n');
}

function requestLogger(req, res, next) {
  const startAt = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - startAt;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    formatLog(level, 'http_request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms,
      ip: req.ip,
      user: req.user?.id || null,
    });
  });

  next();
}

function logSecurityEvent(event, details = {}) {
  formatLog('warn', event, details);
}

module.exports = { requestLogger, logSecurityEvent };
