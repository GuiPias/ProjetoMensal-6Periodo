const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function perfil(req, res) {
  try {
    const resultado = await pool.query(
      'SELECT id, nome, email, papel FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    return res.json(resultado.rows[0]);
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
    let indice = 1;

    if (nome) {
      campos.push(`nome = $${indice++}`);
      valores.push(nome);
    }

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      campos.push(`senha = $${indice++}`);
      valores.push(senhaHash);
    }

    valores.push(req.usuario.id);

    const resultado = await pool.query(
      `UPDATE usuarios SET ${campos.join(', ')} WHERE id = $${indice} RETURNING id, nome, email, papel`,
      valores
    );

    return res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao atualizar perfil' });
  }
}

module.exports = { perfil, atualizarPerfil };
