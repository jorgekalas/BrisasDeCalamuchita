// =============================================================
//   SERVICIO — RESERVAS
// =============================================================
//   Solo logica de consulta (lectura). El POST de crear reserva
//   y los cambios de estado van en el Bloque 7 (es donde estan
//   las reglas complejas: bloqueo 2hs, anti-solapamiento, etc.).
// =============================================================

import * as reservaModelo from '../modelos/reservaModelo.js';
import { NoEncontrado, NoAutorizado } from '../utilidades/errores.js';


// -------------------------------------------------------------
//   Listar reservas (panel admin)
// -------------------------------------------------------------
//   Filtro opcional por estado, paginacion.
// -------------------------------------------------------------
export async function listar({ estado, pagina, porPagina, offset }) {
  const { reservas, total } = await reservaModelo.listar({
    estado,
    offset,
    limite: porPagina,
  });

  return { reservas, total };
}


// -------------------------------------------------------------
//   Listar mis reservas (cliente logueado)
// -------------------------------------------------------------
export async function listarMisReservas(clienteId, { porPagina, offset }) {
  return await reservaModelo.listarPorCliente(clienteId, {
    offset,
    limite: porPagina,
  });
}


// -------------------------------------------------------------
//   Obtener detalle de una reserva
// -------------------------------------------------------------
//   Reglas de autorizacion:
//     - El admin puede ver cualquier reserva
//     - El cliente solo puede ver las suyas
// -------------------------------------------------------------
export async function obtener(id, usuarioActual) {
  const reserva = await reservaModelo.buscarPorId(id);

  if (!reserva) {
    throw new NoEncontrado('La reserva solicitada no existe');
  }

  // Autorizacion: si es cliente, solo puede ver sus propias reservas
  if (
    usuarioActual.tipo === 'cliente' &&
    reserva.cliente.id !== usuarioActual.id
  ) {
    throw new NoAutorizado('No tenes permisos para ver esta reserva');
  }

  return reserva;
}


// -------------------------------------------------------------
//   Obtener disponibilidad (para el calendario publico)
// -------------------------------------------------------------
//   Devuelve los rangos de fechas ocupados.
//   Por defecto los proximos 12 meses si no se pasan fechas.
// -------------------------------------------------------------
export async function obtenerDisponibilidad({ desde, hasta }) {
  // Defaults: desde hoy hasta dentro de 12 meses
  const hoy = new Date();
  const enUnAno = new Date();
  enUnAno.setFullYear(enUnAno.getFullYear() + 1);

  const desdeFinal = desde || hoy.toISOString().slice(0, 10);
  const hastaFinal = hasta || enUnAno.toISOString().slice(0, 10);

  return await reservaModelo.obtenerDisponibilidad({
    desde: desdeFinal,
    hasta: hastaFinal,
  });
}
