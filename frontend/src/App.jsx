import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProveedorApp } from './ContextoApp';
import Layout from './componentes/Layout';
import Landing from './paginas/Landing';
import Disponibilidad from './paginas/Disponibilidad';
import Ingresar from './paginas/Ingresar';
import Registrarse from './paginas/Registrarse';
import Reservar from './paginas/Reservar';
import ReservaEnviada from './paginas/ReservaEnviada';
import MisReservas from './paginas/MisReservas';
import PanelAdmin from './paginas/PanelAdmin';

export default function App() {
  return (
    <ProveedorApp>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/disponibilidad" element={<Disponibilidad />} />
            <Route path="/ingresar" element={<Ingresar />} />
            <Route path="/registrarse" element={<Registrarse />} />
            <Route path="/reservar" element={<Reservar />} />
            <Route path="/reserva-enviada/:id" element={<ReservaEnviada />} />
            <Route path="/mis-reservas" element={<MisReservas />} />
            <Route path="/admin" element={<PanelAdmin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProveedorApp>
  );
}
