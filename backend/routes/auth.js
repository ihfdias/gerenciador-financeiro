const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const auth = require('../middleware/auth');
const { clearCsrfCookie, csrfProtection, setCsrfCookie } = require('../middleware/csrf');
const createRateLimiter = require('../middleware/rateLimit');
const { isValidEmail, sanitizeEmail, sanitizeString } = require('../utils/validation');
const { generateSecureToken } = require('../utils/tokens');
const { parseCookieHeader } = require('../utils/cookies');
const { checkLockout, recordFailure, clearFailures } = require('../middleware/accountLockout');
const { logSecurityEvent } = require('../middleware/logger');

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'financeiro_auth';
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'financeiro_refresh';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

// Applied only to mutation routes — /me is called on every page load and must not be throttled
const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  message: 'Muitas tentativas nesta rota. Tente novamente em alguns minutos.',
});

const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
});

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction || process.env.COOKIE_SECURE === 'true';
  return { httpOnly: true, sameSite: secure ? 'none' : 'lax', secure, path: '/' };
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createAuthPayload(user) {
  return { id: user.id, name: user.name };
}

async function issueTokenPair(user, res) {
  const payload = createAuthPayload(user);
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

  const rawRefreshToken = generateSecureToken(40);
  await RefreshToken.create({
    tokenHash: hashToken(rawRefreshToken),
    user: user._id,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  });

  const csrfToken = generateSecureToken();
  const base = getCookieOptions();

  res.cookie(AUTH_COOKIE_NAME, accessToken, { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, { ...base, maxAge: REFRESH_TOKEN_EXPIRY_MS });
  setCsrfCookie(res, csrfToken);

  return { payload, csrfToken };
}

router.post('/register', authRateLimit, async (req, res) => {
  const name = sanitizeString(req.body?.name);
  const email = sanitizeEmail(req.body?.email);
  const password = req.body?.password;

  if (!name || name.length < 2 || name.length > 80) {
    return res.status(400).json({ msg: 'Informe um nome válido.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ msg: 'Informe um e-mail válido.' });
  }

  if (!password || typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return res.status(400).json({ msg: 'Por favor, insira uma senha com entre 8 e 128 caracteres.' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Usuário já existe.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ msg: 'Usuário registrado com sucesso!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor.' });
  }
});

router.post('/login', loginRateLimit, async (req, res) => {
  const email = sanitizeEmail(req.body?.email);
  const password = req.body?.password;

  if (!isValidEmail(email) || typeof password !== 'string' || !password) {
    return res.status(400).json({ msg: 'Credenciais inválidas.' });
  }

  const lockout = checkLockout(email);
  if (lockout.locked) {
    logSecurityEvent('account_locked', { email, ip: req.ip, retryAfter: lockout.retryAfter });
    res.set('Retry-After', String(lockout.retryAfter));
    return res.status(429).json({
      msg: `Conta bloqueada temporariamente. Tente novamente em ${Math.ceil(lockout.retryAfter / 60)} minuto(s).`,
    });
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      recordFailure(email);
      logSecurityEvent('login_failed', { email, ip: req.ip });
      return res.status(400).json({ msg: 'Credenciais inválidas.' });
    }

    clearFailures(email);
    const { payload, csrfToken } = await issueTokenPair(user, res);
    logSecurityEvent('login_success', { userId: user._id.toString(), ip: req.ip });
    return res.json({ user: payload, csrfToken });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Erro no servidor.' });
  }
});

// Renews the access token using the long-lived refresh token cookie.
// No auth or CSRF middleware: the access token may be expired, and the CSRF
// cookie (24 h) can outlive the window. Security comes from the httpOnly
// refresh-token cookie (unreadable by JS) and CORS blocking cross-origin reads.
router.post('/refresh', authRateLimit, async (req, res) => {
  const cookies = parseCookieHeader(req.header('Cookie'));
  const rawRefreshToken = cookies[REFRESH_COOKIE_NAME];

  if (!rawRefreshToken) {
    return res.status(401).json({ msg: 'Sessão expirada. Faça login novamente.' });
  }

  try {
    const stored = await RefreshToken.findOne({ tokenHash: hashToken(rawRefreshToken) });

    if (!stored || stored.expiresAt < new Date()) {
      const base = getCookieOptions();
      res.clearCookie(AUTH_COOKIE_NAME, base);
      res.clearCookie(REFRESH_COOKIE_NAME, base);
      clearCsrfCookie(res);
      logSecurityEvent('refresh_token_invalid', { ip: req.ip });
      return res.status(401).json({ msg: 'Sessão expirada. Faça login novamente.' });
    }

    const user = await User.findById(stored.user);
    if (!user) {
      await RefreshToken.deleteOne({ _id: stored._id });
      return res.status(401).json({ msg: 'Usuário não encontrado.' });
    }

    // Rotate: revoke current token before issuing a new pair
    await RefreshToken.deleteOne({ _id: stored._id });

    const { payload, csrfToken } = await issueTokenPair(user, res);
    return res.json({ user: payload, csrfToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Erro no servidor.' });
  }
});

router.get('/me', (req, res) => {
  auth(req, res, () => {
    const csrfToken = generateSecureToken();
    setCsrfCookie(res, csrfToken);
    res.json({ user: req.user, csrfToken });
  });
});

router.post('/logout', authRateLimit, auth, csrfProtection, async (req, res) => {
  try {
    const cookies = parseCookieHeader(req.header('Cookie'));
    const rawRefreshToken = cookies[REFRESH_COOKIE_NAME];
    if (rawRefreshToken) {
      await RefreshToken.deleteOne({ tokenHash: hashToken(rawRefreshToken) });
    }
  } catch (err) {
    console.error('Erro ao revogar refresh token:', err.message);
  }

  const base = getCookieOptions();
  res.clearCookie(AUTH_COOKIE_NAME, base);
  res.clearCookie(REFRESH_COOKIE_NAME, base);
  clearCsrfCookie(res);
  res.status(204).send();
});

module.exports = router;
