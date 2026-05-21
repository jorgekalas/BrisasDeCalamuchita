// =============================================================
//   API — PROPIEDAD
// =============================================================
//   Endpoints publicos para mostrar info de la propiedad en la
//   landing y en los formularios.
// =============================================================

import { cliente } from './cliente.js';


// -------------------------------------------------------------
//   GET /api/propiedad
// -------------------------------------------------------------
//   Devuelve un array de propiedades activas. Por ahora siempre
//   trae una sola (id=1) pero el endpoint esta preparado para
//   multiples propiedades.
// -------------------------------------------------------------
export async function listarPropiedades() {
  const { data } = await cliente.get('/api/propiedad');
  return data.datos;
}


// -------------------------------------------------------------
//   GET /api/propiedad/:id
// -------------------------------------------------------------
export async function obtenerPropiedad(id) {
  const { data } = await cliente.get(`/api/propiedad/${id}`);
  return data.datos;
}
