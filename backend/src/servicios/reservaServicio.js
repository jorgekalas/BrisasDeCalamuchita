// =============================================================
//   SERVICIO — RESERVAS
// =============================================================
//   Logica de consulta + maquina de estados de reservas.
// =============================================================

import * as reservaModelo from '../modelos/reservaModelo.js';
import * as propiedadModelo from '../modelos/propiedadModelo.js';
import * as notificacionServicio from './notificacionServicio.js';
import {
  NoEncontrado,
  NoAutorizado,
  Conflicto,
  ReglaDeNegocio,
} from '../utilidades/errores.js';


// -------------------------------------------------------------
//   Constantes de negocio
// -------------------------------------------------------------
//   Estos numeros se podrian leer del .env, pero los dejamos
//   harcodeados para simplificar. Si se cambia la regla, se
//   cambia aca.
// -------------------------------------------------------------
const MINUTOS_BLOQUEO = 120;            // 2 horas (RN-02)
const HORAS_LIMITE_CANCELACION = 24;    // RN-07


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


// =============================================================
//   MAQUINA DE ESTADOS (Bloque 7)
// =============================================================


// -------------------------------------------------------------
//   Helper: validar que la fecha_ingreso este a mas de X horas
// -------------------------------------------------------------
//   Usado en cancelacion por parte del cliente (RN-07: hasta
//   24hs antes del ingreso).
// -------------------------------------------------------------
function horasDeAnticipacion(fechaIngreso) {
  // fechaIngreso viene como Date object (mysql2 lo convirtio)
  const ingreso = fechaIngreso instanceof Date
    ? fechaIngreso
    : new Date(fechaIngreso);

  const ahora = new Date();
  const diffMs = ingreso.getTime() - ahora.getTime();
  return diffMs / (1000 * 60 * 60);
}


// -------------------------------------------------------------
//   Helper: validar que hoy este en el rango de la reserva
// -------------------------------------------------------------
//   Para check-in y check-out queremos asegurarnos de que el
//   admin no marque "En curso" una reserva que es para el mes
//   que viene.
//
//   IMPORTANTE: comparamos strings YYYY-MM-DD, no Date objects.
//   Esto evita problemas con zonas horarias: si ingreso es
//   '2026-05-19', "estar dentro" significa que hoy es ese dia
//   o posterior, sin importar la hora.
// -------------------------------------------------------------
function aISODia(fecha) {
  if (typeof fecha === 'string') {
    // Si ya viene como string YYYY-MM-DD (con o sin hora), corto al dia
    return fecha.slice(0, 10);
  }
  // Si viene como Date, formateo como YYYY-MM-DD en hora local
  const d = new Date(fecha);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fechaDentroDeRango(fecha, ingreso, egreso) {
  const f = aISODia(fecha);
  const ini = aISODia(ingreso);
  const fin = aISODia(egreso);
  return f >= ini && f <= fin;
}


// -------------------------------------------------------------
//   Crear reserva (POST /api/reservas)
// -------------------------------------------------------------
//   Reglas implementadas:
//     - RN-01: no solapamiento (validacion con SELECT antes)
//     - RN-02: bloqueo automatico de 2hs
//     - RN-04: ya validada por Zod (4 a 10 huespedes)
//     - RN-05: vehiculo opcional, max 1 (UNIQUE en BD)
//     - RN-10: ya validada por Zod (fecha futura)
// -------------------------------------------------------------
export async function crearReserva(datos, usuarioActual) {
  // Solo clientes pueden crear reservas para si mismos.
  if (usuarioActual.tipo !== 'cliente') {
    throw new NoAutorizado(
      'Solo los clientes pueden crear reservas. El admin puede gestionarlas pero no crearlas en nombre del cliente.'
    );
  }

  const {
    propiedad_id, fecha_ingreso, fecha_egreso,
    cantidad_huespedes, observaciones, vehiculo,
  } = datos;

  // Validar que la propiedad exista y este activa
  const propiedad = await propiedadModelo.buscarPorId(propiedad_id);
  if (!propiedad) {
    throw new NoEncontrado('La propiedad solicitada no existe');
  }
  if (!propiedad.activa) {
    throw new ReglaDeNegocio('La propiedad no esta disponible para reservas');
  }

  // Validar capacidad real de la propiedad (RN-04)
  if (cantidad_huespedes < propiedad.capacidad_minima ||
      cantidad_huespedes > propiedad.capacidad_maxima) {
    throw new ReglaDeNegocio(
      `La cantidad de huespedes debe estar entre ${propiedad.capacidad_minima} y ${propiedad.capacidad_maxima}`
    );
  }

  // Validar que no haya solapamiento (RN-01)
  // NOTA: en alto volumen esto podria sufrir condiciones de
  // carrera. Solucion definitiva: SELECT FOR UPDATE en transaccion.
  const hayChoque = await reservaModelo.tieneSolapamiento({
    propiedadId: propiedad_id,
    fechaIngreso: fecha_ingreso,
    fechaEgreso: fecha_egreso,
  });

  if (hayChoque) {
    throw new Conflicto(
      'Las fechas elegidas ya estan reservadas. Por favor elegi otras.'
    );
  }

  // Crear la reserva (con vehiculo si vino) en transaccion
  const reserva = await reservaModelo.crearConTransaccion({
    clienteId: usuarioActual.id,
    propiedadId: propiedad_id,
    fechaIngreso: fecha_ingreso,
    fechaEgreso: fecha_egreso,
    cantidadHuespedes: cantidad_huespedes,
    observaciones,
    vehiculo,
    minutosBloqueo: MINUTOS_BLOQUEO,
  });

  // Disparar notificacion de "solicitud recibida" (asincronica, RN-09)
  await notificacionServicio.registrar('solicitud_recibida', reserva);

  return reserva;
}


// -------------------------------------------------------------
//   Confirmar reserva (admin only)
// -------------------------------------------------------------
//   Pasa de Pendiente a Confirmada. Limpia el bloqueo y guarda
//   quien y cuando confirmo.
// -------------------------------------------------------------
export async function confirmar(reservaId, usuarioActual) {
  const reserva = await reservaModelo.buscarPorId(reservaId);
  if (!reserva) {
    throw new NoEncontrado('La reserva no existe');
  }

  if (reserva.estado !== 'Pendiente') {
    throw new ReglaDeNegocio(
      `Solo se pueden confirmar reservas pendientes. Esta esta en estado: ${reserva.estado}`
    );
  }

  const actualizada = await reservaModelo.cambiarEstado(reservaId, 'Confirmada', {
    adminId: usuarioActual.id,
  });

  // Notificar al cliente que su reserva fue confirmada (RN-09)
  await notificacionServicio.registrar('reserva_confirmada', actualizada);

  return actualizada;
}


// -------------------------------------------------------------
//   Cancelar reserva (cliente o admin)
// -------------------------------------------------------------
//   Reglas:
//     - Cliente: solo cancela las suyas, en estado Pendiente o
//       Confirmada, hasta 24hs antes del ingreso (RN-07)
//     - Admin: puede cancelar cualquier Pendiente o Confirmada
//       sin restriccion de tiempo
// -------------------------------------------------------------
export async function cancelar(reservaId, usuarioActual) {
  const reserva = await reservaModelo.buscarPorId(reservaId);
  if (!reserva) {
    throw new NoEncontrado('La reserva no existe');
  }

  const estadosCancelables = ['Pendiente', 'Confirmada'];
  if (!estadosCancelables.includes(reserva.estado)) {
    throw new ReglaDeNegocio(
      `No se puede cancelar una reserva en estado ${reserva.estado}`
    );
  }

  // Si es cliente, validaciones extra
  if (usuarioActual.tipo === 'cliente') {
    // Solo puede cancelar las suyas
    if (reserva.cliente.id !== usuarioActual.id) {
      throw new NoAutorizado('Solo podes cancelar tus propias reservas');
    }

    // Hasta 24hs antes del ingreso
    const horasFaltantes = horasDeAnticipacion(reserva.fecha_ingreso);
    if (horasFaltantes < HORAS_LIMITE_CANCELACION) {
      throw new ReglaDeNegocio(
        `Las cancelaciones se aceptan hasta ${HORAS_LIMITE_CANCELACION} horas antes del ingreso. Comunicate con el administrador.`
      );
    }
  }

  const actualizada = await reservaModelo.cambiarEstado(reservaId, 'Cancelada');

  // Notificar al cliente que su reserva fue cancelada (RN-09)
  await notificacionServicio.registrar('reserva_cancelada', actualizada);

  return actualizada;
}


// -------------------------------------------------------------
//   Check-in (admin only)
// -------------------------------------------------------------
//   Pasa de Confirmada a En curso.
//   El admin solo lo puede hacer en una fecha "razonable":
//   desde el dia de ingreso hasta el de egreso.
// -------------------------------------------------------------
export async function checkIn(reservaId, usuarioActual) {
  const reserva = await reservaModelo.buscarPorId(reservaId);
  if (!reserva) {
    throw new NoEncontrado('La reserva no existe');
  }

  if (reserva.estado !== 'Confirmada') {
    throw new ReglaDeNegocio(
      `Solo se puede hacer check-in de reservas confirmadas. Esta esta en estado: ${reserva.estado}`
    );
  }

  // Validar que hoy este dentro del rango de fechas de la reserva
  const hoy = aISODia(new Date());
  if (!fechaDentroDeRango(hoy, reserva.fecha_ingreso, reserva.fecha_egreso)) {
    throw new ReglaDeNegocio(
      'El check-in solo se puede hacer durante las fechas de la reserva'
    );
  }

  return await reservaModelo.cambiarEstado(reservaId, 'En curso');
}


// -------------------------------------------------------------
//   Check-out (admin only)
// -------------------------------------------------------------
//   Pasa de En curso a Finalizada. Sin restriccion de fecha
//   (puede haber check-out tardio).
// -------------------------------------------------------------
export async function checkOut(reservaId, usuarioActual) {
  const reserva = await reservaModelo.buscarPorId(reservaId);
  if (!reserva) {
    throw new NoEncontrado('La reserva no existe');
  }

  if (reserva.estado !== 'En curso') {
    throw new ReglaDeNegocio(
      `Solo se puede hacer check-out de reservas en curso. Esta esta en estado: ${reserva.estado}`
    );
  }

  const actualizada = await reservaModelo.cambiarEstado(reservaId, 'Finalizada');

  // Notificar agradecimiento al cliente (RN-09)
  await notificacionServicio.registrar('reserva_finalizada', actualizada);

  return actualizada;
}
