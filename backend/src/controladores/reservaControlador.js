// =============================================================
//   CONTROLADOR — RESERVAS
// =============================================================

import * as reservaServicio from '../servicios/reservaServicio.js';
import {
  schemaListarReservas,
  schemaDisponibilidad,
} from '../validadores/recursosValidador.js';
import { exito } from '../utilidades/respuesta.js';
import {
  obtenerPaginacion,
  construirMetadata,
} from '../utilidades/paginacion.js';


// -------------------------------------------------------------
//   GET /api/reservas — listado admin (con filtros y paginacion)
// -------------------------------------------------------------
//   Query params:
//     ?estado=Pendiente    (opcional, filtra por estado)
//     ?pagina=1            (default 1)
//     ?porPagina=10        (default 10, max 100)
//
//   Devuelve: { datos: [...], metadata: { paginacion: {...} } }
// -------------------------------------------------------------
export async function listar(req, res) {
  const { estado } = schemaListarReservas.parse(req.query);
  const { pagina, porPagina, offset } = obtenerPaginacion(req);

  const { reservas, total } = await reservaServicio.listar({
    estado,
    pagina,
    porPagina,
    offset,
  });

  return exito(res, reservas, {
    metadata: construirMetadata(total, pagina, porPagina),
  });
}


// -------------------------------------------------------------
//   GET /api/reservas/:id — detalle (admin o dueño)
// -------------------------------------------------------------
export async function obtener(req, res) {
  const id = Number(req.params.id);
  const reserva = await reservaServicio.obtener(id, req.usuario);
  return exito(res, reserva);
}


// -------------------------------------------------------------
//   GET /api/mis-reservas — listado de cliente logueado
// -------------------------------------------------------------
export async function misReservas(req, res) {
  const { pagina, porPagina, offset } = obtenerPaginacion(req);

  const { reservas, total } = await reservaServicio.listarMisReservas(
    req.usuario.id,
    { porPagina, offset }
  );

  return exito(res, reservas, {
    metadata: construirMetadata(total, pagina, porPagina),
  });
}


// -------------------------------------------------------------
//   GET /api/reservas/disponibilidad — fechas ocupadas
// -------------------------------------------------------------
//   Endpoint PUBLICO. Devuelve los rangos de fechas reservados
//   para que el calendario del frontend los pinte como ocupados.
//
//   Query params (opcionales):
//     ?desde=2026-06-01&hasta=2026-12-31
//   Si no se pasan, devuelve los proximos 12 meses.
// -------------------------------------------------------------
export async function disponibilidad(req, res) {
  const { desde, hasta } = schemaDisponibilidad.parse(req.query);
  const ocupado = await reservaServicio.obtenerDisponibilidad({ desde, hasta });
  return exito(res, ocupado);
}


// =============================================================
//   MAQUINA DE ESTADOS (Bloque 7)
// =============================================================

import { schemaCrearReserva } from '../validadores/reservaValidador.js';
import { creado } from '../utilidades/respuesta.js';


// -------------------------------------------------------------
//   POST /api/reservas — crear reserva (cliente only)
// -------------------------------------------------------------
export async function crear(req, res) {
  const datos = schemaCrearReserva.parse(req.body);
  const reserva = await reservaServicio.crearReserva(datos, req.usuario);
  return creado(res, reserva);
}


// -------------------------------------------------------------
//   POST /api/reservas/:id/confirmar — admin only
// -------------------------------------------------------------
export async function confirmar(req, res) {
  const id = Number(req.params.id);
  const reserva = await reservaServicio.confirmar(id, req.usuario);
  return exito(res, reserva);
}


// -------------------------------------------------------------
//   POST /api/reservas/:id/cancelar — cliente (dueño) o admin
// -------------------------------------------------------------
export async function cancelar(req, res) {
  const id = Number(req.params.id);
  const reserva = await reservaServicio.cancelar(id, req.usuario);
  return exito(res, reserva);
}


// -------------------------------------------------------------
//   POST /api/reservas/:id/check-in — admin only
// -------------------------------------------------------------
export async function checkIn(req, res) {
  const id = Number(req.params.id);
  const reserva = await reservaServicio.checkIn(id, req.usuario);
  return exito(res, reserva);
}


// -------------------------------------------------------------
//   POST /api/reservas/:id/check-out — admin only
// -------------------------------------------------------------
export async function checkOut(req, res) {
  const id = Number(req.params.id);
  const reserva = await reservaServicio.checkOut(id, req.usuario);
  return exito(res, reserva);
}
