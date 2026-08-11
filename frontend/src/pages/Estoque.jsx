import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { listarItens, criarItem, atualizarItem, excluirItem } from '../services/api';

const ITEM_VAZIO = { nome: '', descricao: '', quantidade: 0 };
const LIMITE_ESTOQUE_BAIXO = 5;

function Estoque() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const ehMaster = usuario?.papel === 'master';

  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [itemEmEdicao, setItemEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(ITEM_VAZIO);

  const itensFiltrados = itens.filter((item) =>
    item.nome.toLowerCase().includes(busca.trim().toLowerCase())
  );

  function mostrarSucesso(mensagem) {
    setSucesso(mensagem);
    setTimeout(() => setSucesso(''), 3000);
  }

  function mostrarErro(mensagem) {
    setErro(mensagem);
    setTimeout(() => setErro(''), 4000);
  }

  async function carregarItens() {
    setCarregando(true);
    try {
      const dados = await listarItens();
      setItens(dados);
    } catch (erroRequisicao) {
      mostrarErro(erroRequisicao.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarItens();
  }, []);

  function abrirNovoItem() {
    setItemEmEdicao(null);
    setFormulario(ITEM_VAZIO);
    setFormularioAberto(true);
  }

  function abrirEdicaoItem(item) {
    setItemEmEdicao(item);
    setFormulario({ nome: item.nome, descricao: item.descricao || '', quantidade: item.quantidade });
    setFormularioAberto(true);
  }

  function cancelarFormulario() {
    setFormularioAberto(false);
    setItemEmEdicao(null);
    setFormulario(ITEM_VAZIO);
  }

  async function salvarItem(evento) {
    evento.preventDefault();
    setErro('');

    try {
      if (itemEmEdicao) {
        await atualizarItem(itemEmEdicao.id, formulario);
        mostrarSucesso('Item atualizado com sucesso!');
      } else {
        await criarItem(formulario);
        mostrarSucesso('Item criado com sucesso!');
      }
      cancelarFormulario();
      await carregarItens();
    } catch (erroRequisicao) {
      mostrarErro(erroRequisicao.message);
    }
  }

  async function removerItem(item) {
    if (!window.confirm(`Tem certeza que deseja excluir o item "${item.nome}"?`)) {
      return;
    }

    setErro('');
    try {
      await excluirItem(item.id);
      mostrarSucesso('Item excluído com sucesso!');
      await carregarItens();
    } catch (erroRequisicao) {
      mostrarErro(erroRequisicao.message);
    }
  }

  function alterarQuantidadeLocal(id, novaQuantidade) {
    setItens((atuais) =>
      atuais.map((item) => (item.id === id ? { ...item, quantidade: novaQuantidade } : item))
    );
  }

  async function salvarQuantidade(item, novaQuantidade) {
    if (novaQuantidade === item.quantidade) return;

    setErro('');
    try {
      await atualizarItem(item.id, {
        nome: item.nome,
        descricao: item.descricao,
        quantidade: novaQuantidade,
      });
      mostrarSucesso('Item atualizado com sucesso!');
    } catch (erroRequisicao) {
      mostrarErro(erroRequisicao.message);
      await carregarItens();
    }
  }

  return (
    <div>
      {sucesso && <div className="toast-sucesso">{sucesso}</div>}
      {erro && <div className="toast-erro">{erro}</div>}
      <NavBar />
      <div className="container">
        <div className="cabecalho-pagina">
          <h1>Estoque</h1>
          {ehMaster && (
            <button className="btn btn-primary" onClick={abrirNovoItem}>Novo item</button>
          )}
        </div>

        <input
          type="text"
          className="campo-busca"
          placeholder="Buscar item pelo nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />


        {formularioAberto && (
          <form className="card" onSubmit={salvarItem}>
            <h2>{itemEmEdicao ? 'Editar item' : 'Novo item'}</h2>
            <label>
              Nome
              <input
                type="text"
                value={formulario.nome}
                onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                required
              />
            </label>
            <label>
              Descrição
              <input
                type="text"
                value={formulario.descricao}
                onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
              />
            </label>
            <label>
              Quantidade
              <input
                type="number"
                min="0"
                value={formulario.quantidade}
                onChange={(e) => setFormulario({ ...formulario, quantidade: Number(e.target.value) })}
                required
              />
            </label>
            <div className="acoes-formulario">
              <button className="btn btn-primary" type="submit">Salvar</button>
              <button className="btn" type="button" onClick={cancelarFormulario}>Cancelar</button>
            </div>
          </form>
        )}

        {carregando ? (
          <p>Carregando...</p>
        ) : itensFiltrados.length === 0 ? (
          <p className="estado-vazio">
            {itens.length === 0 ? 'Nenhum item cadastrado.' : 'Nenhum item encontrado para essa busca.'}
          </p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Quantidade</th>
                {ehMaster && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.map((item) => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{item.descricao}</td>
                  <td>
                    <div className="celula-quantidade">
                      {ehMaster ? (
                        <input
                          type="number"
                          min="0"
                          className="input-quantidade"
                          value={item.quantidade}
                          onChange={(e) => alterarQuantidadeLocal(item.id, Math.max(0, Number(e.target.value) || 0))}
                          onBlur={(e) => salvarQuantidade(item, Math.max(0, Number(e.target.value) || 0))}
                        />
                      ) : (
                        item.quantidade
                      )}
                      {item.quantidade === 0 ? (
                        <span className="badge badge-perigo">Sem estoque</span>
                      ) : item.quantidade <= LIMITE_ESTOQUE_BAIXO ? (
                        <span className="badge badge-alerta">Estoque baixo</span>
                      ) : null}
                    </div>
                  </td>
                  {ehMaster && (
                    <td>
                      <button className="btn" onClick={() => abrirEdicaoItem(item)}>Editar</button>
                      <button className="btn btn-danger" onClick={() => removerItem(item)}>Excluir</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Estoque;






