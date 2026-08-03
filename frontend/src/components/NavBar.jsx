import { Link, useNavigate } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  function sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/estoque">Estoque</Link>
        <Link to="/perfil">Perfil</Link>
      </div>
      <div className="navbar-usuario">
        {usuario && (
          <span className="navbar-saudacao">
            Olá, {usuario.nome} <span className="badge-papel">{usuario.papel}</span>
          </span>
        )}
        <button className="btn" onClick={sair}>Sair</button>
      </div>
    </nav>
  );
}

export default NavBar;
