// =============================================================
//   TAREA EN SEGUNDO PLANO — Enviar notificaciones pendientes
// =============================================================
//   Cada 15 segundos:
//     1. Busca notificaciones en estado 'pendiente' o 'fallida'
//        con menos de 3 intentos.
//     2. Las envia una por una (secuencial, no en paralelo, para
//        no abusar de Gmail).
//     3. Marca cada una como 'enviada' o 'fallida' segun resultado.
//
//   Guards:
//     - No corre si NODE_ENV=pruebas.
//     - No corre dos veces en paralelo (guard con `ejecucionEnProgreso`).
// =============================================================

import * as notificacionServicio from '../servicios/notificacionServicio.js';
import * as emailServicio from '../servicios/emailServicio.js';


// -------------------------------------------------------------
//   Configuracion
// -------------------------------------------------------------
const INTERVALO_MS = 15_000;     // cada 15 segundos
const MAX_INTENTOS  = 3;         // hasta 3 intentos por notificacion
const LOTE_TAMANO   = 20;        // procesa hasta 20 por ciclo


// -------------------------------------------------------------
//   Estado interno
// -------------------------------------------------------------
let intervaloId = null;
let ejecucionEnProgreso = false;


// -------------------------------------------------------------
//   Procesar un lote
// -------------------------------------------------------------
async function ejecutar() {
  if (ejecucionEnProgreso) return;
  ejecucionEnProgreso = true;

  try {
    const pendientes = await notificacionServicio.buscarPendientes(
      MAX_INTENTOS, LOTE_TAMANO
    );

    if (pendientes.length === 0) return;

    let enviadas = 0, fallidas = 0;

    for (const notif of pendientes) {
      const resultado = await emailServicio.enviar({
        destinatario: notif.destinatario_email,
        asunto: notif.asunto,
        cuerpo: notif.cuerpo,
      });

      if (resultado.ok) {
        await notificacionServicio.marcarEnviada(notif.id);
        enviadas++;
      } else {
        await notificacionServicio.marcarFallida(notif.id, resultado.error);
        fallidas++;
      }
    }

    if (enviadas > 0 || fallidas > 0) {
      console.log(
        `[notif] Lote procesado: ${enviadas} enviada(s), ${fallidas} fallida(s)`
      );
    }
  } catch (error) {
    console.error('[notif] Error procesando lote:', error.message);
  } finally {
    ejecucionEnProgreso = false;
  }
}


// -------------------------------------------------------------
//   Iniciar el cron
// -------------------------------------------------------------
export function iniciarCronEnviarNotificaciones() {
  if (intervaloId !== null) {
    console.warn('[notif] Cron ya estaba corriendo, ignorando.');
    return;
  }

  // Primera pasada inmediata
  ejecutar();

  intervaloId = setInterval(ejecutar, INTERVALO_MS);
  console.log(`[notif] Cron de envio: cada ${INTERVALO_MS / 1000}s, max ${MAX_INTENTOS} intentos`);
}


// -------------------------------------------------------------
//   Detener el cron (para graceful shutdown)
// -------------------------------------------------------------
export function detenerCronEnviarNotificaciones() {
  if (intervaloId !== null) {
    clearInterval(intervaloId);
    intervaloId = null;
  }
}
