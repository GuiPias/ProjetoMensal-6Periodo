const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('token');
}

async function requisicao(caminho, opcoes = {}) {
  const token = getToken();

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  });

  let dados = null;
  const texto = await resposta.text();
  if (texto) {
    dados = JSON.parse(texto);
  }

  if (!resposta.ok) {
    const mensagem = dados?.erro || 'Erro na requisição';
    throw new Error(mensagem);
  }

  return dados;
}

export function login(email, senha) {
  return requisicao('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}

export function listarItens() {
  return requisicao('/itens');
}

export function buscarItem(id) {
  return requisicao(`/itens/${id}`);
}

export function criarItem(item) {
  return requisicao('/itens', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export function atualizarItem(id, item) {
  return requisicao(`/itens/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  });
}

export function excluirItem(id) {
  return requisicao(`/itens/${id}`, {
    method: 'DELETE',
  });
}

export function buscarPerfil() {
  return requisicao('/usuario/perfil');
}

export function atualizarPerfil(dados) {
  return requisicao('/usuario/perfil', {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}
