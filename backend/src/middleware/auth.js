const jwt = require('jsonwebtoken');
require('dotenv').config();

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não informado' });
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({ erro: 'Token não informado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    return next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

function apenasMaster(req, res, next) {
  if (!req.usuario || req.usuario.papel !== 'master') {
    return res.status(403).json({ erro: 'Acesso restrito a usuários master' });
  }
  return next();
}

module.exports = { autenticar, apenasMaster };
