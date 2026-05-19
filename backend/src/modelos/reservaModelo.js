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


// =============================================================
//   ESCRITURA (Bloque 7)
// =============================================================


// -------------------------------------------------------------
//   Verificar solapamiento de fechas
// -------------------------------------------------------------
//   Devuelve true si las fechas chocan con alguna reserva
//   "activa" (Pendiente, Confirmada, En curso).
//
//   Logica de solapamiento (RN-01):
//     existeOtraReserva
//        WHERE estado IN (activos)
//          AND fecha_ingreso < <nuestra fecha_egreso>
//          AND fecha_egreso  > <nuestra fecha_ingreso>
//
//   Es la formula estandar de solapamiento de rangos.
//
//   NOTA: validar con SELECT antes de INSERT es vulnerable a
//   condiciones de carrera si dos clientes envian POST al mismo
//   tiempo (los dos ven libre, ambos insertan). Para volumen
//   bajo es aceptable. Para alto volumen seria SELECT FOR UPDATE
//   en transaccion.
// -------------------------------------------------------------
export async function tieneSolapamiento({ propiedadId, fechaIngreso, fechaEgreso, ignorarId = null }) {
  const params = [propiedadId, fechaEgreso, fechaIngreso];
  let sql = `
    SELECT id, fecha_ingreso, fecha_egreso, estado
      FROM reserva
     WHERE propiedad_id = ?
       AND estado IN ('Pendiente', 'Confirmada', 'En curso')
       AND fecha_ingreso < ?
       AND fecha_egreso  > ?
  `;

  if (ignorarId) {
    sql += ' AND id <> ?';
    params.push(ignorarId);
  }

  sql += ' LIMIT 1';

  const [filas] = await pool.query(sql, params);
  return filas.length > 0;
}


// -------------------------------------------------------------
//   Crear reserva (transaccional)
// -------------------------------------------------------------
//   Inserta:
//     1. La reserva con estado 'Pendiente' y bloqueo_hasta = NOW + 2 horas
//     2. El vehiculo asociado (si vino en el body)
//
//   Si algo falla en el medio, rollback. Es la primera transaccion
//   compleja del sistema.
//
//   Devuelve la reserva completa con datos anidados (para que el
//   frontend la pueda mostrar sin pedirla de nuevo).
// -------------------------------------------------------------
export async function crearConTransaccion(datos) {
  const { clienteId, propiedadId, fechaIngreso, fechaEgreso,
          cantidadHuespedes, observaciones, vehiculo,
          minutosBloqueo = 120 } = datos;

  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    // 1. Insertar la reserva en estado Pendiente con bloqueo de 2hs.
    //    bloqueo_hasta usa NOW() del servidor, no del cliente.
    const [resReserva] = await conexion.query(
      `INSERT INTO reserva
         (cliente_id, propiedad_id, fecha_ingreso, fecha_egreso,
          cantidad_huespedes, estado, observaciones, bloqueo_hasta)
       VALUES (?, ?, ?, ?, ?, 'Pendiente', ?,
               DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? MINUTE))`,
      [
        clienteId, propiedadId, fechaIngreso, fechaEgreso,
        cantidadHuespedes, observaciones || null, minutosBloqueo,
      ]
    );
    const reservaId = resReserva.insertId;

    // 2. Si vino vehiculo, insertarlo (RN-05: max 1 por reserva,
    //    garantizado por UNIQUE en la tabla)
    if (vehiculo && vehiculo.patente && vehiculo.modelo) {
      await conexion.query(
        `INSERT INTO vehiculo (reserva_id, patente, modelo)
         VALUES (?, ?, ?)`,
        [reservaId, vehiculo.patente, vehiculo.modelo]
      );
    }

    await conexion.commit();

    // Devolver la reserva completa con todos los JOINs (cliente + vehiculo)
    return await buscarPorId(reservaId);
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}


// -------------------------------------------------------------
//   Cambiar estado (helper genérico)
// -------------------------------------------------------------
//   Actualiza el estado de la reserva y opcionalmente otros
//   campos relacionados al cambio:
//     - confirmada_en: cuando pasa a Confirmada
//     - admin_confirmador_id: idem
//     - bloqueo_hasta: se limpia al confirmar o cancelar
//
//   Devuelve la reserva actualizada (completa, con JOINs).
// -------------------------------------------------------------
export async function cambiarEstado(reservaId, nuevoEstado, opciones = {}) {
  const partes = ['estado = ?'];
  const valores = [nuevoEstado];

  // Si confirmamos, registramos el admin y la fecha
  if (nuevoEstado === 'Confirmada') {
    if (opciones.adminId) {
      partes.push('admin_confirmador_id = ?');
      valores.push(opciones.adminId);
    }
    partes.push('confirmada_en = CURRENT_TIMESTAMP');
  }

  // Al confirmar o cancelar, el bloqueo ya no aplica
  if (nuevoEstado === 'Confirmada' || nuevoEstado === 'Cancelada') {
    partes.push('bloqueo_hasta = NULL');
  }

  valores.push(reservaId);

  await pool.query(
    `UPDATE reserva SET ${partes.join(', ')} WHERE id = ?`,
    valores
  );

  return await buscarPorId(reservaId);
}


// -------------------------------------------------------------
//   Cancelar todas las reservas pendientes con bloqueo vencido
// -------------------------------------------------------------
//   La usa el cron job interno (RN-03). Pasa a 'Cancelada' todas
//   las pendientes cuyo bloqueo_hasta ya quedo en el pasado.
//
//   Devuelve la cantidad de reservas afectadas y los IDs.
// -------------------------------------------------------------
export async function cancelarBloqueosVencidos() {
  // Primero buscar los IDs afectados (para retornarlos)
  const [filas] = await pool.query(
    `SELECT id FROM reserva
      WHERE estado = 'Pendiente'
        AND bloqueo_hasta IS NOT NULL
        AND bloqueo_hasta <= CURRENT_TIMESTAMP`
  );

  if (filas.length === 0) {
    return { cantidad: 0, ids: [] };
  }

  const ids = filas.map(f => f.id);

  // Ejecutar el UPDATE masivo
  const [resultado] = await pool.query(
    `UPDATE reserva
        SET estado = 'Cancelada',
            bloqueo_hasta = NULL
      WHERE id IN (?)`,
    [ids]
  );

  return { cantidad: resultado.affectedRows, ids };
}
