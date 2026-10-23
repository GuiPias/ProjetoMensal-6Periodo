const express = require('express');
const cors = require('cors');
const os = require('os');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const itensRoutes = require('./routes/itens.routes');
const usuarioRoutes = require('./routes/usuario.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Expõe o Pod que atendeu a requisição, usado para demonstrar o balanceamento entre réplicas no Kubernetes.
app.use((req, res, next) => {
  res.setHeader('X-Pod', os.hostname());
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', pod: os.hostname() });
});

app.use('/auth', authRoutes);
app.use('/itens', itensRoutes);
app.use('/usuario', usuarioRoutes);

module.exports = app;
