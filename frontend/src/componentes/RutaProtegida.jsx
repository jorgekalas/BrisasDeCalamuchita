// =============================================================
//   COMPONENTE — RUTA PROTEGIDA
// =============================================================
//   Wrapper que valida autenticacion antes de mostrar el contenido.
//
//   Uso en App.jsx:
//     <Route path="/mis-reservas" element={
//       <RutaProtegida rol="cliente"><MisReservas /></RutaProtegida>
//     } />
//
//   Props:
//     - children: el contenido a mostrar si pasa la validacion
//     - rol: opcional ('cliente' o 'administrador'). Si se pasa,
//       el usuario debe tener exactamente ese rol.
//
//   Comportamiento:
//     - Si todavia se esta rehidratando la sesion (al cargar la
//       app por primera vez), muestra un placeholder breve.
//     - Si no hay usuario logueado, redirige a /ingresar con
//       ?volver=<ruta-actual> para volver despues del login.
//     - Si hay usuario pero el rol no coincide, muestra un mensaje
//       de "Acceso denegado" sin redirigir.
// =============================================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexto/ContextoAuth';
import { ShieldAlert } from 'lucide-react';


export default function RutaProtegida({ children, rol = null }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  // -----------------------------------------------------------
  //   Rehidratando: mostrar placeholder mientras se verifica
  //   el token contra el backend al cargar la app
  // -----------------------------------------------------------
  if (cargando) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center text-piedra-700 text-sm">
        Verificando sesión...
      </div>
    );
  }

  // -----------------------------------------------------------
  //   No hay usuario logueado: ir a login conservando la ruta
  //   para volver despues
  // -----------------------------------------------------------
  if (!usuario) {
    return (
      <Navigate
        to={`/ingresar?volver=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // -----------------------------------------------------------
  //   Hay usuario pero el rol no coincide
  // -----------------------------------------------------------
  if (rol && usuario.tipo !== rol) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="inline-flex w-14 h-14 rounded-full bg-red-100 text-red-600 items-center justify-center mb-4">
          <ShieldAlert size={28} />
        </div>
        <h1 className="font-display text-2xl text-piedra-900 mb-2">Acceso denegado</h1>
        <p className="text-sm text-piedra-700">
          Esta sección requiere permisos de {rol === 'administrador' ? 'administrador' : 'cliente'}.
        </p>
      </div>
    );
  }

  // -----------------------------------------------------------
  //   Todo OK, renderizar el contenido protegido
  // -----------------------------------------------------------
  return children;
}
