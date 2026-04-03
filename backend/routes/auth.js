const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const {
  clearCsrfCookie,
  csrfProtection,
  setCsrfCookie,
} = require('../middleware/csrf');
const createRateLimiter = require('../middleware/rateLimit');
const {
  isValidEmail,
  isValidObjectId,
  sanitizeEmail,
  sanitizeString,
} = require('../utils/validation');
const { generateSecureToken } = require('../utils/tokens');

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'financeiro_auth';
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

  return {
    httpOnly: true,
    sameSite: secure ? 'none' : 'lax',
    secure,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  };
}

function createAuthPayload(user) {
  return { id: user.id, name: user.name };
}

router.use(authRateLimit);

router.post('/register', async (req, res) => {
  const name = sanitizeString(req.body?.name);
  const email = sanitizeEmail(req.body?.email);
  const password = req.body?.password;

  if (!name || name.length < 2 || name.length > 80) {
    return res.status(400).json({ msg: 'Informe um nome válido.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ msg: 'Informe um e-mail válido.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ msg: 'Por favor, insira uma senha com no mínimo 6 caracteres.' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Usuário já existe.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashedPassword });
    await user.save();
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

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ msg: 'Credenciais inválidas.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Credenciais inválidas.' });

    const payload = createAuthPayload(user);
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    const csrfToken = generateSecureToken();
    res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
    setCsrfCookie(res, csrfToken);
    res.json({ user: payload, csrfToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor.' });
  }
});

router.get('/me', async (req, res) => {
  auth(req, res, () => {
    const csrfToken = generateSecureToken();
    setCsrfCookie(res, csrfToken);
    res.json({ user: req.user, csrfToken });
  });
});

router.post('/logout', auth, csrfProtection, (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...getCookieOptions(),
    maxAge: undefined,
  });
  clearCsrfCookie(res);
  res.status(204).send();
});

module.exports = router;
