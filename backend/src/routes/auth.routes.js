const express = require('express');
const { login, registrar } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', login);
router.post('/registrar', registrar);

module.exports = router;
