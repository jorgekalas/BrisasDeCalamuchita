import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProveedorAuth } from './contexto/ContextoAuth';
import Layout from './componentes/Layout';
import RutaProtegida from './componentes/RutaProtegida';
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
    <ProveedorAuth>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Rutas publicas */}
            <Route path="/" element={<Landing />} />
            <Route path="/disponibilidad" element={<Disponibilidad />} />
            <Route path="/ingresar" element={<Ingresar />} />
            <Route path="/registrarse" element={<Registrarse />} />

            {/* Rutas autenticadas (cualquier usuario logueado) */}
            <Route path="/reservar" element={
              <RutaProtegida rol="cliente"><Reservar /></RutaProtegida>
            } />
            <Route path="/reserva-enviada/:id" element={
              <RutaProtegida><ReservaEnviada /></RutaProtegida>
            } />
            <Route path="/mis-reservas" element={
              <RutaProtegida rol="cliente"><MisReservas /></RutaProtegida>
            } />

            {/* Rutas solo admin */}
            <Route path="/admin" element={
              <RutaProtegida rol="administrador"><PanelAdmin /></RutaProtegida>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProveedorAuth>
  );
}
