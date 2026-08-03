const pool = require('../config/db');

async function listar(req, res) {
  try {
    const resultado = await pool.query('SELECT * FROM itens ORDER BY id');
    return res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao listar itens' });
  }
}

async function buscarPorId(req, res) {
  const { id } = req.params;

  try {
    const resultado = await pool.query('SELECT * FROM itens WHERE id = $1', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }

    return res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao buscar item' });
  }
}

async function criar(req, res) {
  const { nome, descricao, quantidade } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome do item é obrigatório' });
  }

  try {
    const resultado = await pool.query(
      'INSERT INTO itens (nome, descricao, quantidade) VALUES ($1, $2, $3) RETURNING *',
      [nome, descricao || null, quantidade || 0]
    );
    return res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao criar item' });
  }
}

async function atualizar(req, res) {
  const { id } = req.params;
  const { nome, descricao, quantidade } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome do item é obrigatório' });
  }

  try {
    const resultado = await pool.query(
      'UPDATE itens SET nome = $1, descricao = $2, quantidade = $3, atualizado_em = NOW() WHERE id = $4 RETURNING *',
      [nome, descricao || null, quantidade || 0, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }

    return res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao atualizar item' });
  }
}

async function excluir(req, res) {
  const { id } = req.params;

  try {
    const resultado = await pool.query('DELETE FROM itens WHERE id = $1 RETURNING id', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }

    return res.status(204).send();
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao excluir item' });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
