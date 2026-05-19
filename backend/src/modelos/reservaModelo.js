// =============================================================
//   MODELO — RESERVA
// =============================================================
//   Queries SQL relacionadas a reservas. Es la tabla mas grande
//   del proyecto y tiene multiples relaciones, asi que las
//   queries traen los datos anidados con JOINs.
//
//   Convencion del JOIN:
//     reserva.cliente  → datos de la tabla cliente + usuario
//     reserva.pago     → datos de la tabla pago (puede ser null)
//     reserva.vehiculo → datos de la tabla vehiculo (puede ser null)
//
//   Para el listado paginado solo traemos campos basicos.
//   Para el detalle traemos todo.
// =============================================================

import { pool } from '../config/bd.js';


// -------------------------------------------------------------
//   Helper interno: armar el objeto reserva anidado a partir
//   de una fila plana con JOINs.
// -------------------------------------------------------------
//   Como MySQL devuelve todos los campos en una fila aplanada,
//   armamos manualmente la estructura anidada que espera el
//   frontend: { id, fechas..., cliente: {...}, pago: {...}, vehiculo: {...} }
// -------------------------------------------------------------
function armarReservaAnidada(fila) {
  if (!fila) return null;

  const reserva = {
    id: fila.id,
    fecha_ingreso: fila.fecha_ingreso,
    fecha_egreso: fila.fecha_egreso,
    cantidad_huespedes: fila.cantidad_huespedes,
    estado: fila.estado,
    observaciones: fila.observaciones,
    bloqueo_hasta: fila.bloqueo_hasta,
    confirmada_en: fila.confirmada_en,
    creada_en: fila.creada_en,
    actualizada_en: fila.actualizada_en,

    cliente: {
      id: fila.cliente_id,
      nombre: fila.cliente_nombre,
      apellido: fila.cliente_apellido,
      email: fila.cliente_email,
      telefono: fila.cliente_telefono,
      dni: fila.cliente_dni,
    },
  };

  // Pago: puede ser null si la reserva todavia no tiene pago cargado.
  if (fila.pago_id) {
    reserva.pago = {
      id: fila.pago_id,
      estado_pago: fila.pago_estado,
      monto_sena: parseFloat(fila.pago_monto_sena || 0),
      monto_total: parseFloat(fila.pago_monto_total || 0),
      metodo: fila.pago_metodo,
    };
  } else {
    reserva.pago = null;
  }

  // Vehiculo: puede ser null si el cliente vino sin auto (RN-05).
  if (fila.vehiculo_id) {
    reserva.vehiculo = {
      id: fila.vehiculo_id,
      patente: fila.vehiculo_patente,
      modelo: fila.vehiculo_modelo,
    };
  } else {
    reserva.vehiculo = null;
  }

  return reserva;
}


// -------------------------------------------------------------
//   Query base con todos los JOINs (la reusamos)
// -------------------------------------------------------------
const SELECT_RESERVA_COMPLETA = `
  SELECT
    r.id,
    r.fecha_ingreso,
    r.fecha_egreso,
    r.cantidad_huespedes,
    r.estado,
    r.observaciones,
    r.bloqueo_hasta,
    r.confirmada_en,
    r.creada_en,
    r.actualizada_en,

    r.cliente_id        AS cliente_id,
    u.nombre            AS cliente_nombre,
    u.apellido          AS cliente_apellido,
    u.email             AS cliente_email,
    u.telefono          AS cliente_telefono,
    c.dni               AS cliente_dni,

    p.id                AS pago_id,
    p.estado_pago       AS pago_estado,
    p.monto_sena        AS pago_monto_sena,
    p.monto_total       AS pago_monto_total,
    p.metodo            AS pago_metodo,

    v.id                AS vehiculo_id,
    v.patente           AS vehiculo_patente,
    v.modelo            AS vehiculo_modelo
  FROM reserva r
  JOIN cliente c   ON c.usuario_id = r.cliente_id
  JOIN usuario u   ON u.id         = r.cliente_id
  LEFT JOIN pago p     ON p.reserva_id  = r.id
  LEFT JOIN vehiculo v ON v.reserva_id  = r.id
`;


// -------------------------------------------------------------
//   Listar reservas (con paginacion y filtro por estado)
// -------------------------------------------------------------
//   Devuelve { reservas, total } para que el controlador pueda
//   armar la metadata de paginacion.
// -------------------------------------------------------------
export async function listar({ estado = null, offset = 0, limite = 10 }) {
  // Filtro opcional por estado
  const where = estado ? 'WHERE r.estado = ?' : '';
  const params = estado ? [estado] : [];

  // Total para la metadata
  const [filasConteo] = await pool.query(
    `SELECT COUNT(*) AS total FROM reserva r ${where}`,
    params
  );
  const total = filasConteo[0].total;

  // Listado paginado, ordenado por fecha de creacion descendente
  // (las mas recientes primero, util para el panel admin)
  const [filas] = await pool.query(
    `${SELECT_RESERVA_COMPLETA}
     ${where}
     ORDER BY r.creada_en DESC
     LIMIT ? OFFSET ?`,
    [...params, limite, offset]
  );

  return {
    reservas: filas.map(armarReservaAnidada),
    total,
  };
}


// -------------------------------------------------------------
//   Detalle de una reserva por ID
// -------------------------------------------------------------
export async function buscarPorId(id) {
  const [filas] = await pool.query(
    `${SELECT_RESERVA_COMPLETA}
     WHERE r.id = ?
     LIMIT 1`,
    [id]
  );
  return armarReservaAnidada(filas[0]);
}


// -------------------------------------------------------------
//   Listar reservas de un cliente especifico (mis reservas)
// -------------------------------------------------------------
//   Ordenadas: futuras primero (las mas cercanas arriba), despues
//   las pasadas. Asi el cliente ve primero lo que le importa.
// -------------------------------------------------------------
export async function listarPorCliente(clienteId, { offset = 0, limite = 10 } = {}) {
  // Conteo total para metadata
  const [filasConteo] = await pool.query(
    `SELECT COUNT(*) AS total FROM reserva WHERE cliente_id = ?`,
    [clienteId]
  );
  const total = filasConteo[0].total;

  // Listado: ordenamos primero las "vivas" (pendiente, confirmada, en curso)
  // por fecha de ingreso ascendente, despues las finalizadas/canceladas
  // por fecha de ingreso descendente. ORDER BY con CASE.
  const [filas] = await pool.query(
    `${SELECT_RESERVA_COMPLETA}
     WHERE r.cliente_id = ?
     ORDER BY
       CASE r.estado
         WHEN 'En curso'    THEN 1
         WHEN 'Pendiente'   THEN 2
         WHEN 'Confirmada'  THEN 3
         WHEN 'Finalizada'  THEN 4
         WHEN 'Cancelada'   THEN 5
         WHEN 'No Show'     THEN 6
       END,
       r.fecha_ingreso DESC
     LIMIT ? OFFSET ?`,
    [clienteId, limite, offset]
  );

  return {
    reservas: filas.map(armarReservaAnidada),
    total,
  };
}


// -------------------------------------------------------------
//   Buscar fechas reservadas (para el calendario publico)
// -------------------------------------------------------------
//   Devuelve solo los rangos de fechas que estan ocupados:
//   reservas en estado 'Pendiente', 'Confirmada' o 'En curso'.
//   Las canceladas / finalizadas no bloquean fechas.
//
//   Por defecto trae los proximos 12 meses, pero acepta rango.
// -------------------------------------------------------------
export async function obtenerDisponibilidad({ desde, hasta }) {
  const [filas] = await pool.query(
    `SELECT
       r.id,
       r.fecha_ingreso,
       r.fecha_egreso,
       r.estado
     FROM reserva r
     WHERE r.estado IN ('Pendiente', 'Confirmada', 'En curso')
       AND r.fecha_egreso  >= ?
       AND r.fecha_ingreso <= ?
     ORDER BY r.fecha_ingreso`,
    [desde, hasta]
  );
  return filas;
}
