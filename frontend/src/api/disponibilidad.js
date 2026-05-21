// =============================================================
//   API — DISPONIBILIDAD
// =============================================================
//   Endpoint publico que devuelve los rangos de fechas
//   ocupados (reservas en estado Pendiente, Confirmada o
//   En curso). Lo usa el calendario para pintar fechas no
//   disponibles.
// =============================================================

import { cliente } from './cliente.js';


// -------------------------------------------------------------
//   GET /api/reservas/disponibilidad?desde=&hasta=
// -------------------------------------------------------------
//   Devuelve un array con los rangos ocupados:
//     [{ id, fecha_ingreso, fecha_egreso, estado }, ...]
//
//   Si no se pasa rango, el backend devuelve los proximos 12 meses.
// -------------------------------------------------------------
export async function obtenerDisponibilidad({ desde, hasta } = {}) {
  const params = {};
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;

  const { data } = await cliente.get('/api/reservas/disponibilidad', { params });
  return data.datos;
}
