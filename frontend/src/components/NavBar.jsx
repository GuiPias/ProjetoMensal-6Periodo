import { Link, useNavigate } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate();

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
      <button className="btn" onClick={sair}>Sair</button>
    </nav>
  );
}

export default NavBar;
