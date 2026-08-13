import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Estoque from '../src/pages/Estoque';

vi.mock('../src/services/api', () => ({
  listarItens: vi.fn().mockResolvedValue([
    { id: 1, nome: 'Caneta', descricao: 'Caneta azul', quantidade: 10 },
  ]),
  criarItem: vi.fn(),
  atualizarItem: vi.fn(),
  excluirItem: vi.fn(),
}));

function definirUsuarioLogado(papel) {
  localStorage.setItem('usuario', JSON.stringify({ id: 1, nome: 'Usuário Teste', papel }));
}

function renderEstoque() {
  return render(
    <MemoryRouter>
      <Estoque />
    </MemoryRouter>
  );
}

describe('Estoque', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('mostra o botão de novo item quando o usuário é master', async () => {
    definirUsuarioLogado('master');
    renderEstoque();

    expect(await screen.findByText('Novo item')).toBeInTheDocument();
  });

  it('não mostra os botões de editar/excluir quando o usuário é comum', async () => {
    definirUsuarioLogado('comum');
    renderEstoque();

    expect(await screen.findByText('Caneta')).toBeInTheDocument();
    expect(screen.queryByText('Novo item')).not.toBeInTheDocument();
    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
    expect(screen.queryByText('Excluir')).not.toBeInTheDocument();
  });
});
