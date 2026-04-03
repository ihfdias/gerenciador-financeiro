const jwt = require('jsonwebtoken');
const { parseCookieHeader } = require('../utils/cookies');

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'financeiro_auth';

module.exports = function (req, res, next) { 
  const authHeader = req.header('Authorization');
  const cookies = parseCookieHeader(req.header('Cookie'));
  const cookieToken = cookies[AUTH_COOKIE_NAME];

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ msg: 'Configuração de autenticação inválida.' });
  }

  let token = cookieToken;

  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    return res.status(401).json({ msg: 'Nenhum token, autorização negada.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, name: decoded.name };
    next(); 
  } catch (err) {
    res.status(401).json({ msg: 'Token inválido.' });
  }
};
