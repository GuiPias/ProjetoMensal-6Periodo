process.env.JWT_SECRET = 'segredo_de_teste';

const bcrypt = require('bcryptjs');
const request = require('supertest');

jest.mock('../src/config/db', () => ({
  query: jest.fn(),
}));

const pool = require('../src/config/db');
const app = require('../src/app');

describe('POST /auth/login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('retorna um token quando as credenciais estão corretas', async () => {
    const senhaHash = await bcrypt.hash('senha123', 10);
    pool.query.mockResolvedValueOnce([
      [{ id: 1, nome: 'Usuário Teste', email: 'teste@estoque.com', senha: senhaHash, papel: 'comum' }],
    ]);

    const resposta = await request(app)
      .post('/auth/login')
      .send({ email: 'teste@estoque.com', senha: 'senha123' });

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveProperty('token');
  });

  it('retorna 401 quando a senha está errada', async () => {
    const senhaHash = await bcrypt.hash('senha123', 10);
    pool.query.mockResolvedValueOnce([
      [{ id: 1, nome: 'Usuário Teste', email: 'teste@estoque.com', senha: senhaHash, papel: 'comum' }],
    ]);

    const resposta = await request(app)
      .post('/auth/login')
      .send({ email: 'teste@estoque.com', senha: 'senhaErrada' });

    expect(resposta.status).toBe(401);
  });

  it('retorna 401 quando o email não existe', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const resposta = await request(app)
      .post('/auth/login')
      .send({ email: 'naoexiste@estoque.com', senha: 'qualquer' });

    expect(resposta.status).toBe(401);
  });
});
