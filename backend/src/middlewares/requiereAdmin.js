// =============================================================
//   MIDDLEWARE — REQUIERE ADMIN
// =============================================================
//   Verifica que req.usuario.tipo === 'administrador'.
//   IMPORTANTE: se monta DESPUES de requiereAuth.
//
//   Uso en una ruta:
//     app.delete('/api/reservas/:id', requiereAuth, requiereAdmin, ...)
// =============================================================

import { NoAutorizado, NoAutenticado } from '../utilidades/errores.js';


export function requiereAdmin(req, _res, next) {
  // Si no hay usuario en req es porque requiereAuth no se monto antes.
  // En desarrollo lo detectamos para evitar bugs.
  if (!req.usuario) {
    return next(new NoAutenticado(
      'requiereAdmin necesita estar despues de requiereAuth'
    ));
  }

  if (req.usuario.tipo !== 'administrador') {
    return next(new NoAutorizado(
      'Esta accion requiere permisos de administrador'
    ));
  }

  next();
}
