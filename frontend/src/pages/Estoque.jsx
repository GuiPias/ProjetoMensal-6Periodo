import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { listarItens, criarItem, atualizarItem, excluirItem } from '../services/api';

const ITEM_VAZIO = { nome: '', descricao: '', quantidade: 0 };

function Estoque() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const ehMaster = usuario?.papel === 'master';

  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [itemEmEdicao, setItemEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(ITEM_VAZIO);

  function mostrarSucesso(mensagem) {
    setSucesso(mensagem);
    setTimeout(() => setSucesso(''), 3000);
  }

  async function carregarItens() {
    setCarregando(true);
    try {
      const dados = await listarItens();
      setItens(dados);
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message);
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
      setErro(erroRequisicao.message);
    }
  }

  async function removerItem(id) {
    setErro('');
    try {
      await excluirItem(id);
      mostrarSucesso('Item excluído com sucesso!');
      await carregarItens();
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message);
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
      setErro(erroRequisicao.message);
      await carregarItens();
    }
  }

  return (
    <div>
      {sucesso && <div className="toast-sucesso">{sucesso}</div>}
      <NavBar />
      <div className="container">
        <div className="cabecalho-pagina">
          <h1>Estoque</h1>
          {ehMaster && (
            <button className="btn btn-primary" onClick={abrirNovoItem}>Novo item</button>
          )}
        </div>

        {erro && <p className="mensagem-erro">{erro}</p>}

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
              {itens.map((item) => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{item.descricao}</td>
                  <td>
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
                  </td>
                  {ehMaster && (
                    <td>
                      <button className="btn" onClick={() => abrirEdicaoItem(item)}>Editar</button>
                      <button className="btn btn-danger" onClick={() => removerItem(item.id)}>Excluir</button>
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
