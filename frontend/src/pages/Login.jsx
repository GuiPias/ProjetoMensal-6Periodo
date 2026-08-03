import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro('');

    try {
      const resposta = await login(email, senha);
      localStorage.setItem('token', resposta.token);
      localStorage.setItem('usuario', JSON.stringify(resposta.usuario));
      navigate('/estoque');
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message);
    }
  }

  return (
    <div className="pagina-login">
      <form className="card" onSubmit={aoEnviar}>
        <h1>Sistema de Estoque</h1>
        {erro && <p className="mensagem-erro">{erro}</p>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </label>
        <button className="btn btn-primary" type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
