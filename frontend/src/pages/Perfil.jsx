import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { buscarPerfil, atualizarPerfil } from '../services/api';

function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [novoNome, setNovoNome] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  async function carregarPerfil() {
    try {
      const dados = await buscarPerfil();
      setPerfil(dados);
      setNovoNome(dados.nome);
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message);
    }
  }

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function salvarPerfil(evento) {
    evento.preventDefault();
    setErro('');
    setMensagem('');

    try {
      const dados = { nome: novoNome };
      if (novaSenha) {
        dados.senha = novaSenha;
      }
      const atualizado = await atualizarPerfil(dados);
      setPerfil(atualizado);
      setNovaSenha('');

      const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || 'null');
      if (usuarioLocal) {
        localStorage.setItem('usuario', JSON.stringify({ ...usuarioLocal, nome: atualizado.nome }));
      }

      setMensagem('Dados atualizados com sucesso');
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message);
    }
  }

  if (!perfil) {
    return (
      <div>
        <NavBar />
        <div className="container">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className="container">
        <h1>Perfil</h1>
        <div className="card">
          <p><strong>Email:</strong> {perfil.email}</p>
          <p><strong>Papel:</strong> {perfil.papel}</p>
        </div>

        <form className="card" onSubmit={salvarPerfil}>
          <h2>Editar dados</h2>
          {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}
          {erro && <p className="mensagem-erro">{erro}</p>}
          <label>
            Novo nome
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              required
            />
          </label>
          <label>
            Nova senha
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Deixe em branco para não alterar"
            />
          </label>
          <button className="btn btn-primary" type="submit">Salvar</button>
        </form>
      </div>
    </div>
  );
}

export default Perfil;
