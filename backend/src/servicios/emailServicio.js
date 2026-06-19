// =============================================================
//   SERVICIO — EMAIL
// =============================================================
//   Capa de envio real por HTTP API. Soporta dos modos:
//
//     - simulado (EMAIL_MODO=simulado): loggea a consola y
//       NO envia nada. Perfecto para desarrollo y tests.
//     - real (EMAIL_MODO=real): usa Resend (resend.com).
//       Necesita RESEND_API_KEY configurada.
//
//   El cron de notificaciones llama a `enviar()` sin saber
//   en que modo esta. Asi podemos cambiar entre modos solo
//   cambiando el .env, sin tocar codigo.
//
//   HISTORICO: hasta junio 2026 usaba Gmail SMTP via Nodemailer.
//   Render free tier bloquea el puerto 587 saliente, asi que
//   migramos a Resend que usa HTTPS estandar.
// =============================================================

import { env } from '../config/env.js';


// -------------------------------------------------------------
//   Endpoint de la API de Resend
// -------------------------------------------------------------
const RESEND_API_URL = 'https://api.resend.com/emails';


// -------------------------------------------------------------
//   Enviar un email
// -------------------------------------------------------------
//   Recibe { destinatario, asunto, cuerpo } y devuelve un
//   objeto { ok: boolean, error?: string, messageId?: string }.
//
//   Nunca tira excepciones: convierte cualquier error en
//   { ok: false, error: '...' } para que el cron pueda
//   marcar la notificacion como fallida sin caerse.
// -------------------------------------------------------------
export async function enviar({ destinatario, asunto, cuerpo }) {
  const modo = env.EMAIL_MODO || 'simulado';

  // --- Modo simulado: logguear a consola ---
  if (modo === 'simulado') {
    console.log('');
    console.log('--------- [EMAIL SIMULADO] ---------');
    console.log(`Para:    ${destinatario}`);
    console.log(`Asunto:  ${asunto}`);
    console.log(`Cuerpo:  ${cuerpo.length} caracteres de HTML`);
    console.log('------------------------------------');
    return { ok: true, simulado: true };
  }

  // --- Modo real: Resend via HTTP API ---
  if (!env.RESEND_API_KEY) {
    return {
      ok: false,
      error: 'RESEND_API_KEY no configurada en variables de entorno',
    };
  }

  const remitenteNombre = env.EMAIL_REMITENTE_NOMBRE || 'Brisas de Calamuchita';
  // onboarding@resend.dev: remitente compartido que Resend ofrece sin verificar
  // dominio. Cuando el proyecto tenga dominio propio, cambiar por
  // notificaciones@<dominio-verificado>.
  const remitenteEmail = env.EMAIL_REMITENTE_DIRECCION || 'onboarding@resend.dev';

  try {
    const respuesta = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${remitenteNombre} <${remitenteEmail}>`,
        to: destinatario,
        subject: asunto,
        html: cuerpo,
      }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      // La API de Resend devuelve { name, message, statusCode } en errores
      const motivo = datos?.message || datos?.error || `HTTP ${respuesta.status}`;
      return { ok: false, error: motivo };
    }

    return { ok: true, messageId: datos.id };
  } catch (error) {
    return {
      ok: false,
      error: error.message || 'Error desconocido al enviar el email',
    };
  }
}


// -------------------------------------------------------------
//   Verificar la conexion con Resend (para diagnostico)
// -------------------------------------------------------------
//   Hace un fetch al endpoint de API keys solo para confirmar
//   que la key es valida. No envia ningun email.
// -------------------------------------------------------------
export async function verificarConexion() {
  if (env.EMAIL_MODO === 'simulado') {
    return { ok: true, modo: 'simulado' };
  }

  if (!env.RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY no configurada' };
  }

  try {
    // GET /api-keys solo lista las keys (no las usa para enviar).
    // Si la API key es valida, devuelve 200.
    const respuesta = await fetch('https://api.resend.com/api-keys', {
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}` },
    });

    if (!respuesta.ok) {
      const datos = await respuesta.json().catch(() => ({}));
      return {
        ok: false,
        error: `API key invalida o sin permisos (HTTP ${respuesta.status}): ${datos?.message || 'sin detalle'}`,
      };
    }

    return { ok: true, modo: 'real', proveedor: 'resend' };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
