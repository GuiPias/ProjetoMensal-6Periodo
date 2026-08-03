const express = require('express');
const { listar, buscarPorId, criar, atualizar, excluir } = require('../controllers/itens.controller');
const { autenticar, apenasMaster } = require('../middleware/auth');

const router = express.Router();

router.get('/', autenticar, listar);
router.get('/:id', autenticar, buscarPorId);
router.post('/', autenticar, apenasMaster, criar);
router.put('/:id', autenticar, apenasMaster, atualizar);
router.delete('/:id', autenticar, apenasMaster, excluir);

module.exports = router;
