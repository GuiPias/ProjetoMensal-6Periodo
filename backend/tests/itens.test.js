process.env.JWT_SECRET = 'segredo_de_teste';

const jwt = require('jsonwebtoken');
const request = require('supertest');

jest.mock('../src/config/db', () => ({
  query: jest.fn(),
}));

const app = require('../src/app');

function gerarToken(papel) {
  return jwt.sign({ id: 1, nome: 'Usuário Teste', papel }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
}

describe('GET /itens', () => {
  it('retorna 401 quando não é enviado token', async () => {
    const resposta = await request(app).get('/itens');
    expect(resposta.status).toBe(401);
  });
});

describe('POST /itens', () => {
  it('retorna 403 quando o usuário logado não é master', async () => {
    const token = gerarToken('comum');

    const resposta = await request(app)
      .post('/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Item de teste', quantidade: 5 });

    expect(resposta.status).toBe(403);
  });
});
