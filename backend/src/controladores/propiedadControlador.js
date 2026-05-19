// =============================================================
//   CONTROLADOR — PROPIEDAD
// =============================================================

import * as propiedadServicio from '../servicios/propiedadServicio.js';
import { schemaActualizarPropiedad } from '../validadores/recursosValidador.js';
import { exito } from '../utilidades/respuesta.js';


// -------------------------------------------------------------
//   GET /api/propiedad — listado publico
// -------------------------------------------------------------
//   Devuelve las propiedades activas (por ahora solo una).
//   Acceso publico (sin auth).
// -------------------------------------------------------------
export async function listar(_req, res) {
  const propiedades = await propiedadServicio.listar();
  return exito(res, propiedades);
}


// -------------------------------------------------------------
//   GET /api/propiedad/:id — detalle publico
// -------------------------------------------------------------
export async function obtener(req, res) {
  const id = Number(req.params.id);
  const propiedad = await propiedadServicio.obtener(id);
  return exito(res, propiedad);
}


// -------------------------------------------------------------
//   PUT /api/propiedad/:id — actualizar (solo admin)
// -------------------------------------------------------------
export async function actualizar(req, res) {
  const id = Number(req.params.id);
  const cambios = schemaActualizarPropiedad.parse(req.body);
  const actualizada = await propiedadServicio.actualizar(id, cambios);
  return exito(res, actualizada);
}
