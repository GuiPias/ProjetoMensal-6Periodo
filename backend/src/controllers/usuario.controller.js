const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function perfil(req, res) {
  try {
    const [linhas] = await pool.query(
      'SELECT id, nome, email, papel FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );

    if (linhas.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    return res.json(linhas[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao buscar perfil' });
  }
}

async function atualizarPerfil(req, res) {
  const { nome, senha } = req.body;

  if (!nome && !senha) {
    return res.status(400).json({ erro: 'Informe nome e/ou senha para atualizar' });
  }

  try {
    const campos = [];
    const valores = [];

    if (nome) {
      campos.push('nome = ?');
      valores.push(nome);
    }

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      campos.push('senha = ?');
      valores.push(senhaHash);
    }

    valores.push(req.usuario.id);

    await pool.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, valores);

    const [linhas] = await pool.query(
      'SELECT id, nome, email, papel FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );

    return res.json(linhas[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao atualizar perfil' });
  }
}

module.exports = { perfil, atualizarPerfil };
