// =============================================================
//   SERVICIO — NOTIFICACIONES
// =============================================================
//   Patron Outbox: cuando ocurre un cambio de estado en una
//   reserva, registramos una fila en la tabla `notificacion`
//   con estado_envio = 'pendiente'. NO mandamos el email aca.
//
//   El cron `enviarNotificacionesPendientes.js` se ocupa del
//   envio real. Asi:
//     - Los endpoints responden rapido (no esperan SMTP)
//     - Si Gmail falla, los emails se acumulan y reintentan
//     - La tabla queda como historial completo (RN-09)
// =============================================================

import { pool } from '../config/bd.js';
import { PLANTILLAS } from '../plantillas/emails.js';


// -------------------------------------------------------------
//   Registrar una notificacion para envio asincronico
// -------------------------------------------------------------
//   Recibe el tipo de evento y los datos de la reserva,
//   busca la plantilla correspondiente, y crea la fila en
//   estado 'pendiente'. Errores no se propagan: si esto falla
//   por algun motivo, queremos que la operacion principal
//   (crear/confirmar/cancelar la reserva) NO se rompa.
// -------------------------------------------------------------
export async function registrar(tipo, reserva) {
  const plantilla = PLANTILLAS[tipo];
  if (!plantilla) {
    console.error(`[notificacion] Tipo desconocido: ${tipo}`);
    return null;
  }

  if (!reserva || !reserva.cliente?.email) {
    console.error('[notificacion] Reserva sin cliente.email:', reserva?.id);
    return null;
  }

  try {
    const { asunto, cuerpo } = plantilla(reserva);

    const [resultado] = await pool.query(
      `INSERT INTO notificacion
         (reserva_id, tipo, destinatario_email, asunto, cuerpo,
          estado_envio, intentos)
       VALUES (?, ?, ?, ?, ?, 'pendiente', 0)`,
      [reserva.id, tipo, reserva.cliente.email, asunto, cuerpo]
    );

    return { id: resultado.insertId, tipo, reservaId: reserva.id };
  } catch (error) {
    // No tiramos error: queremos que el flujo principal continue.
    // Loggeamos para que el admin vea que algo paso.
    console.error('[notificacion] Error registrando:', error.message);
    return null;
  }
}


// -------------------------------------------------------------
//   Buscar notificaciones pendientes (las usa el cron)
// -------------------------------------------------------------
//   Trae las pendientes y las que fallaron pero tienen menos
//   de 3 intentos. Ordenadas por antiguedad para procesar
//   primero las mas viejas.
// -------------------------------------------------------------
export async function buscarPendientes(maxIntentos = 3, limite = 20) {
  const [filas] = await pool.query(
    `SELECT id, reserva_id, tipo, destinatario_email, asunto, cuerpo,
            estado_envio, intentos
       FROM notificacion
      WHERE estado_envio IN ('pendiente', 'fallida')
        AND intentos < ?
      ORDER BY creada_en ASC
      LIMIT ?`,
    [maxIntentos, limite]
  );
  return filas;
}


// -------------------------------------------------------------
//   Marcar una notificacion como enviada
// -------------------------------------------------------------
export async function marcarEnviada(notificacionId) {
  await pool.query(
    `UPDATE notificacion
        SET estado_envio = 'enviada',
            enviada_en   = CURRENT_TIMESTAMP,
            error_ultimo_intento = NULL,
            intentos = intentos + 1
      WHERE id = ?`,
    [notificacionId]
  );
}


// -------------------------------------------------------------
//   Marcar una notificacion como fallida (con detalle)
// -------------------------------------------------------------
export async function marcarFallida(notificacionId, mensajeError) {
  await pool.query(
    `UPDATE notificacion
        SET estado_envio = 'fallida',
            error_ultimo_intento = ?,
            intentos = intentos + 1
      WHERE id = ?`,
    [mensajeError?.substring(0, 1000) || 'Error desconocido', notificacionId]
  );
}
