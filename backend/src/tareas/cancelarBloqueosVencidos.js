// =============================================================
//   TAREA EN SEGUNDO PLANO — Cancelar bloqueos vencidos (RN-03)
// =============================================================
//   Cron interno con setInterval. Cada 60 segundos revisa las
//   reservas pendientes cuyo bloqueo_hasta ya quedo en el pasado
//   y las pasa a 'Cancelada'.
//
//   Mecanismo:
//     - Funciona dentro del mismo proceso Node (no requiere otro
//       servicio externo como Redis, cron de sistema, etc.).
//     - Se inicia desde servidor.js al arrancar.
//     - Se detiene en el graceful shutdown.
//
//   Ventajas: simple, sin infra extra, sirve para Railway tambien.
//   Desventaja: si tenes varias instancias del backend corriendo,
//   las dos ejecutan el cron y compiten por las mismas filas.
//   Como por ahora corremos una sola instancia, no es problema.
// =============================================================

import * as reservaModelo from '../modelos/reservaModelo.js';
import * as notificacionServicio from '../servicios/notificacionServicio.js';


// -------------------------------------------------------------
//   Configuracion
// -------------------------------------------------------------
const INTERVALO_MS = 60_000;  // cada 60 segundos


// -------------------------------------------------------------
//   Estado del cron (para start/stop)
// -------------------------------------------------------------
let intervaloId = null;
let ejecucionEnProgreso = false;


// -------------------------------------------------------------
//   Ejecutar una pasada
// -------------------------------------------------------------
//   Hacemos un guard con ejecucionEnProgreso para evitar
//   solapamiento si una iteracion tarda mas de 60s.
// -------------------------------------------------------------
async function ejecutar() {
  if (ejecucionEnProgreso) return;
  ejecucionEnProgreso = true;

  try {
    const resultado = await reservaModelo.cancelarBloqueosVencidos();

    if (resultado.cantidad > 0) {
      console.log(
        `[cron] ${resultado.cantidad} reserva(s) cancelada(s) por bloqueo vencido: ` +
        `IDs ${resultado.ids.join(', ')}`
      );

      // Notificar al cliente de cada reserva cancelada (RN-09)
      for (const idReserva of resultado.ids) {
        const reserva = await reservaModelo.buscarPorId(idReserva);
        if (reserva) {
          await notificacionServicio.registrar('bloqueo_vencido', reserva);
        }
      }
    }
  } catch (error) {
    console.error('[cron] Error cancelando bloqueos vencidos:', error.message);
  } finally {
    ejecucionEnProgreso = false;
  }
}


// -------------------------------------------------------------
//   Iniciar el cron
// -------------------------------------------------------------
export function iniciarCronCancelarBloqueosVencidos() {
  if (intervaloId !== null) {
    console.warn('⚠ [cron] Ya estaba corriendo, ignorando.');
    return;
  }

  // No esperamos a la primera ejecucion: corre inmediatamente al
  // arrancar y despues cada INTERVALO_MS.
  ejecutar();

  intervaloId = setInterval(ejecutar, INTERVALO_MS);
  console.log(`[cron] Cancelar bloqueos vencidos: cada ${INTERVALO_MS / 1000}s`);
}


// -------------------------------------------------------------
//   Detener el cron (para graceful shutdown)
// -------------------------------------------------------------
export function detenerCronCancelarBloqueosVencidos() {
  if (intervaloId !== null) {
    clearInterval(intervaloId);
    intervaloId = null;
  }
}
