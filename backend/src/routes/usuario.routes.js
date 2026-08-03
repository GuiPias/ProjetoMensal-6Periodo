const express = require('express');
const { perfil, atualizarPerfil } = require('../controllers/usuario.controller');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

router.get('/perfil', autenticar, perfil);
router.put('/perfil', autenticar, atualizarPerfil);

module.exports = router;
