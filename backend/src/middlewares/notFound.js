// =============================================================
//   MIDDLEWARE — NOT FOUND (404)
// =============================================================
//   Se monta al final de todas las rutas. Si una request llega
//   hasta aca es porque ninguna ruta la atendio: respondemos 404.
// =============================================================

import { NoEncontrado } from '../utilidades/errores.js';

export function notFound(req, _res, next) {
  // Pasamos el error al manejador centralizado en lugar de
  // responder aca directamente. Asi todas las respuestas de
  // error tienen el mismo formato.
  next(new NoEncontrado(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}
