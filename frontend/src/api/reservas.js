// =============================================================
//   API — RESERVAS
// =============================================================
//   Todos los endpoints de reservas. Algunos requieren auth
//   (el interceptor de cliente.js agrega el token automaticamente).
// =============================================================

import { cliente } from './cliente.js';


// -------------------------------------------------------------
//   POST /api/reservas — crear una nueva (cliente only)
// -------------------------------------------------------------
//   datos = {
//     propiedad_id, fecha_ingreso, fecha_egreso,
//     cantidad_huespedes, observaciones?, vehiculo?: { patente, modelo }
//   }
// -------------------------------------------------------------
export async function crearReserva(datos) {
  const { data } = await cliente.post('/api/reservas', datos);
  return data.datos;
}


// -------------------------------------------------------------
//   GET /api/reservas — listado (admin only, con paginacion)
// -------------------------------------------------------------
export async function listarReservas({ pagina = 1, porPagina = 10, estado } = {}) {
  const params = { pagina, porPagina };
  if (estado) params.estado = estado;

  const { data } = await cliente.get('/api/reservas', { params });
  return {
    reservas: data.datos,
    metadata: data.metadata,
  };
}


// -------------------------------------------------------------
//   GET /api/mis-reservas — del cliente logueado
// -------------------------------------------------------------
export async function listarMisReservas({ pagina = 1, porPagina = 20 } = {}) {
  const { data } = await cliente.get('/api/mis-reservas', {
    params: { pagina, porPagina },
  });
  return {
    reservas: data.datos,
    metadata: data.metadata,
  };
}


// -------------------------------------------------------------
//   GET /api/reservas/:id — detalle
// -------------------------------------------------------------
export async function obtenerReserva(id) {
  const { data } = await cliente.get(`/api/reservas/${id}`);
  return data.datos;
}


// -------------------------------------------------------------
//   Transiciones de estado (Bloque 7)
// -------------------------------------------------------------
export async function confirmarReserva(id) {
  const { data } = await cliente.post(`/api/reservas/${id}/confirmar`);
  return data.datos;
}

export async function cancelarReserva(id) {
  const { data } = await cliente.post(`/api/reservas/${id}/cancelar`);
  return data.datos;
}

export async function checkInReserva(id) {
  const { data } = await cliente.post(`/api/reservas/${id}/check-in`);
  return data.datos;
}

export async function checkOutReserva(id) {
  const { data } = await cliente.post(`/api/reservas/${id}/check-out`);
  return data.datos;
}
