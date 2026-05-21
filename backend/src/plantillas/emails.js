// =============================================================
//   PLANTILLAS DE EMAIL
// =============================================================
//   Una funcion por tipo de notificacion. Cada una recibe los
//   datos de la reserva y devuelve un objeto { asunto, cuerpo }
//   listo para insertar en la tabla notificacion.
//
//   Decisiones de diseno:
//   - HTML simple en strings, sin librerias de templating extra
//   - Estilos inline (max compatibilidad con clientes de correo)
//   - Mismo header/footer en todas para coherencia visual
//   - Paleta sobria coherente con la marca
//   - Textos con acentos correctos (UTF-8, español neutro)
// =============================================================


// -------------------------------------------------------------
//   Helpers
// -------------------------------------------------------------

// Formatea una fecha como "lunes 15 de marzo de 2027"
function formatearFecha(fecha) {
  const f = fecha instanceof Date ? fecha : new Date(fecha);
  return f.toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// Convierte un numero a un string con separadores de miles
// y signo de pesos. Ejemplo: 85000 -> "$85.000"
function formatearMoneda(monto) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(monto);
}


// -------------------------------------------------------------
//   Layout comun (header y footer)
// -------------------------------------------------------------
function layout(contenidoHtml) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Brisas de Calamuchita</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#2c5530;padding:24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:normal;">
              Brisas de Calamuchita
            </h1>
            <p style="margin:6px 0 0;color:#c8d6c9;font-size:13px;">
              Santa Rosa de Calamuchita, Córdoba
            </p>
          </td>
        </tr>
        <tr><td style="padding:32px 28px;">${contenidoHtml}</td></tr>
        <tr>
          <td style="background:#f0f0f0;padding:18px;text-align:center;color:#666;font-size:12px;border-top:1px solid #e0e0e0;">
            Este es un mensaje automático, por favor no respondas a esta dirección.<br>
            Para consultas: <a href="https://wa.me/5493546528237" style="color:#2c5530;text-decoration:none;">+54 9 3546 52-8237</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}


// -------------------------------------------------------------
//   Resumen de la reserva (caja gris)
// -------------------------------------------------------------
function bloqueResumen(reserva) {
  const filas = [
    ['Fecha de ingreso', formatearFecha(reserva.fecha_ingreso)],
    ['Fecha de egreso',  formatearFecha(reserva.fecha_egreso)],
    ['Huéspedes',        `${reserva.cantidad_huespedes} personas`],
  ];

  if (reserva.vehiculo) {
    filas.push(['Vehículo', `${reserva.vehiculo.modelo} (${reserva.vehiculo.patente})`]);
  }

  if (reserva.pago) {
    filas.push(['Monto total', formatearMoneda(reserva.pago.monto_total)]);
  }

  const filasHtml = filas.map(([etiqueta, valor]) => `
    <tr>
      <td style="padding:6px 0;color:#666;width:40%;">${etiqueta}</td>
      <td style="padding:6px 0;color:#222;font-weight:bold;">${valor}</td>
    </tr>`).join('');

  return `
    <div style="background:#f9f9f9;border:1px solid #e0e0e0;border-radius:6px;padding:18px;margin:20px 0;">
      <h3 style="margin:0 0 12px;color:#2c5530;font-size:15px;text-transform:uppercase;letter-spacing:0.5px;">
        Detalle de la reserva #${reserva.id}
      </h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
        ${filasHtml}
      </table>
    </div>`;
}


// =============================================================
//   PLANTILLAS POR TIPO
// =============================================================


// -------------------------------------------------------------
//   1. solicitud_recibida — recién creada (estado Pendiente)
// -------------------------------------------------------------
export function plantillaSolicitudRecibida(reserva) {
  return {
    asunto: `Recibimos tu solicitud de reserva #${reserva.id}`,
    cuerpo: layout(`
      <h2 style="margin:0 0 16px;color:#2c5530;font-size:20px;">
        Hola ${reserva.cliente.nombre},
      </h2>
      <p style="margin:0 0 16px;line-height:1.6;">
        Recibimos tu solicitud de reserva y te contactaremos en las próximas
        <strong>2 horas</strong> para confirmarla.
      </p>
      ${bloqueResumen(reserva)}
      <p style="margin:16px 0;line-height:1.6;color:#666;font-size:14px;">
        Si en 2 horas no recibís respuesta, la reserva se cancelará
        automáticamente y podrás volver a solicitarla.
      </p>
      <p style="margin:24px 0 0;line-height:1.6;">
        Gracias por elegirnos.
      </p>`),
  };
}


// -------------------------------------------------------------
//   2. reserva_confirmada — admin la confirma
// -------------------------------------------------------------
export function plantillaReservaConfirmada(reserva) {
  return {
    asunto: `Tu reserva #${reserva.id} fue confirmada`,
    cuerpo: layout(`
      <h2 style="margin:0 0 16px;color:#2c5530;font-size:20px;">
        ¡Excelente, ${reserva.cliente.nombre}!
      </h2>
      <p style="margin:0 0 16px;line-height:1.6;">
        Tu reserva fue <strong>confirmada</strong>. Ya podés organizar tu
        viaje con tranquilidad.
      </p>
      ${bloqueResumen(reserva)}
      <div style="background:#e8f0e9;border-left:4px solid #2c5530;padding:14px 16px;margin:20px 0;">
        <p style="margin:0;font-size:14px;line-height:1.6;color:#2c5530;">
          <strong>Qué llevar:</strong> artículos de higiene personal y lo que
          quieran para pasar días inolvidables. Toallas, sábanas y elementos
          de cocina los proveemos nosotros.
        </p>
      </div>
      <p style="margin:24px 0 0;line-height:1.6;">
        Cualquier consulta, escribinos.<br>
        ¡Te esperamos!
      </p>`),
  };
}


// -------------------------------------------------------------
//   3. reserva_cancelada — cancelacion por cliente o admin
// -------------------------------------------------------------
export function plantillaReservaCancelada(reserva) {
  return {
    asunto: `Tu reserva #${reserva.id} fue cancelada`,
    cuerpo: layout(`
      <h2 style="margin:0 0 16px;color:#2c5530;font-size:20px;">
        Hola ${reserva.cliente.nombre},
      </h2>
      <p style="margin:0 0 16px;line-height:1.6;">
        Confirmamos la cancelación de tu reserva.
      </p>
      ${bloqueResumen(reserva)}
      <p style="margin:16px 0;line-height:1.6;">
        Si esto fue un error o tenés dudas sobre el reintegro,
        comunicate con nosotros.
      </p>
      <p style="margin:24px 0 0;line-height:1.6;">
        Esperamos verte pronto.
      </p>`),
  };
}


// -------------------------------------------------------------
//   4. bloqueo_vencido — el cron la cancelo
// -------------------------------------------------------------
export function plantillaBloqueoVencido(reserva) {
  return {
    asunto: `Tu solicitud de reserva #${reserva.id} fue cancelada`,
    cuerpo: layout(`
      <h2 style="margin:0 0 16px;color:#2c5530;font-size:20px;">
        Hola ${reserva.cliente.nombre},
      </h2>
      <p style="margin:0 0 16px;line-height:1.6;">
        Tu solicitud de reserva se canceló automáticamente porque no logramos
        confirmarla dentro de las 2 horas habituales. Esto puede deberse
        a alta demanda del momento o que las fechas ya no estaban disponibles.
      </p>
      ${bloqueResumen(reserva)}
      <p style="margin:16px 0;line-height:1.6;">
        Podés volver a intentar la reserva en cualquier momento desde
        nuestro sitio web.
      </p>
      <p style="margin:24px 0 0;line-height:1.6;">
        Disculpá las molestias.
      </p>`),
  };
}


// -------------------------------------------------------------
//   5. reserva_finalizada — check-out
// -------------------------------------------------------------
export function plantillaReservaFinalizada(reserva) {
  return {
    asunto: `Gracias por elegirnos, ${reserva.cliente.nombre}`,
    cuerpo: layout(`
      <h2 style="margin:0 0 16px;color:#2c5530;font-size:20px;">
        Gracias por elegirnos, ${reserva.cliente.nombre}
      </h2>
      <p style="margin:0 0 16px;line-height:1.6;">
        Esperamos que hayan disfrutado su estadía con nosotros. Fue un placer
        recibirlos en Brisas de Calamuchita.
      </p>
      ${bloqueResumen(reserva)}
      <p style="margin:16px 0;line-height:1.6;">
        Si te gustaría volver, te esperamos con la misma calidez de siempre.
        Y si tenés algún comentario que nos ayude a mejorar, podés
        escribirnos por WhatsApp al
        <a href="https://wa.me/5493546528237" style="color:#2c5530;font-weight:bold;text-decoration:none;">+54 9 3546 52-8237</a>.
      </p>
      <p style="margin:24px 0 0;line-height:1.6;">
        ¡Hasta la próxima!
      </p>`),
  };
}


// -------------------------------------------------------------
//   Mapeo tipo -> funcion (para uso desde el servicio)
// -------------------------------------------------------------
export const PLANTILLAS = {
  solicitud_recibida:  plantillaSolicitudRecibida,
  reserva_confirmada:  plantillaReservaConfirmada,
  reserva_cancelada:   plantillaReservaCancelada,
  bloqueo_vencido:     plantillaBloqueoVencido,
  reserva_finalizada:  plantillaReservaFinalizada,
};
