// =============================================================
//   SERVICIO — EMAIL
// =============================================================
//   Capa de envio real por SMTP. Soporta dos modos:
//
//     - simulado (EMAIL_MODO=simulado): loggea a consola y
//       NO envia nada. Perfecto para desarrollo y tests.
//     - real (EMAIL_MODO=real): usa Nodemailer con Gmail SMTP.
//       Necesita EMAIL_USUARIO, EMAIL_PASSWORD (app password)
//       configurados.
//
//   El cron de notificaciones llama a `enviar()` sin saber
//   en que modo esta. Asi podemos cambiar entre modos solo
//   cambiando el .env, sin tocar codigo.
// =============================================================

import { env } from '../config/env.js';


// -------------------------------------------------------------
//   Transporter de Nodemailer (lazy, solo si modo real)
// -------------------------------------------------------------
//   Lo creamos la primera vez que se necesita, no al importar
//   el modulo. Asi en modo simulado no requerimos nodemailer.
// -------------------------------------------------------------
let transporter = null;

async function obtenerTransporter() {
  if (transporter) return transporter;

  const nodemailer = (await import('nodemailer')).default;

  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST || 'smtp.gmail.com',
    port: env.EMAIL_PUERTO || 587,
    secure: false,  // STARTTLS en 587
    auth: {
      user: env.EMAIL_USUARIO,
      pass: env.EMAIL_PASSWORD,
    },
  });

  return transporter;
}


// -------------------------------------------------------------
//   Enviar un email
// -------------------------------------------------------------
//   Recibe { destinatario, asunto, cuerpo } y devuelve un
//   objeto { ok: boolean, error?: string }.
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

  // --- Modo real: SMTP con Nodemailer ---
  try {
    const transport = await obtenerTransporter();

    const remitenteNombre = env.EMAIL_REMITENTE_NOMBRE || 'Brisas de Calamuchita';
    const remitenteEmail  = env.EMAIL_USUARIO;

    const info = await transport.sendMail({
      from: `"${remitenteNombre}" <${remitenteEmail}>`,
      to: destinatario,
      subject: asunto,
      html: cuerpo,
      // Forzar UTF-8: sin esto algunos clientes interpretan los bytes
      // como Latin-1 y se ven "MarÃ­a" en vez de "María", "Cordoba"
      // en vez de "Córdoba", etc.
      textEncoding: 'base64',
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
      },
    });

    return { ok: true, messageId: info.messageId };
  } catch (error) {
    return {
      ok: false,
      error: error.message || 'Error desconocido al enviar el email',
    };
  }
}


// -------------------------------------------------------------
//   Verificar la conexion SMTP (para diagnostico)
// -------------------------------------------------------------
//   Se puede llamar al arrancar el servidor para validar que
//   las credenciales estan bien antes de empezar a procesar.
// -------------------------------------------------------------
export async function verificarConexion() {
  if (env.EMAIL_MODO === 'simulado') {
    return { ok: true, modo: 'simulado' };
  }

  try {
    const transport = await obtenerTransporter();
    await transport.verify();
    return { ok: true, modo: 'real' };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
