const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const pool = require('../config/db');

async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  try {
    const [linhas] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const usuario = linhas[0];

    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, papel: usuario.papel },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
      },
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao realizar login' });
  }
}

async function registrar(req, res) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
  }

  try {
    const [existente] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);

    if (existente.length > 0) {
      return res.status(409).json({ erro: 'Já existe um usuário com este email' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, papel) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, 'comum']
    );

    return res.status(201).json({ id: resultado.insertId, nome, email, papel: 'comum' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao registrar usuário' });
  }
}

module.exports = { login, registrar };
