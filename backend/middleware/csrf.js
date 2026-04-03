const crypto = require('crypto');
const { parseCookieHeader } = require('../utils/cookies');

const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || 'financeiro_csrf';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function setCsrfCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction || process.env.COOKIE_SECURE === 'true';

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: secure ? 'none' : 'lax',
    secure,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
}

function clearCsrfCookie(res) {
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction || process.env.COOKIE_SECURE === 'true';

  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: false,
    sameSite: secure ? 'none' : 'lax',
    secure,
    path: '/',
  });
}

function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const cookies = parseCookieHeader(req.header('Cookie'));
  const cookieToken = cookies[CSRF_COOKIE_NAME];
  const headerToken = req.header('X-CSRF-Token');

  if (!cookieToken || !headerToken) {
    return res.status(403).json({ msg: 'Token CSRF ausente.' });
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);

  if (
    cookieBuffer.length !== headerBuffer.length ||
    !crypto.timingSafeEqual(cookieBuffer, headerBuffer)
  ) {
    return res.status(403).json({ msg: 'Token CSRF inválido.' });
  }

  return next();
}

module.exports = {
  clearCsrfCookie,
  csrfProtection,
  CSRF_COOKIE_NAME,
  setCsrfCookie,
};
