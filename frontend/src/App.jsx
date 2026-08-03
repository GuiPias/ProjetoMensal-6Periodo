import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Estoque from './pages/Estoque';
import Perfil from './pages/Perfil';
import RotaProtegida from './components/RotaProtegida';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/estoque"
        element={
          <RotaProtegida>
            <Estoque />
          </RotaProtegida>
        }
      />
      <Route
        path="/perfil"
        element={
          <RotaProtegida>
            <Perfil />
          </RotaProtegida>
        }
      />
    </Routes>
  );
}

export default App;
