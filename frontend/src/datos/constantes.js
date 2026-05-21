// =============================================================
//   CONSTANTES Y HELPERS COMPARTIDOS
// =============================================================
//   Antes vivian en `datos/mock.js` junto con los datos simulados.
//   Ahora que los datos vienen del backend, separamos las
//   constantes y helpers para que sigan disponibles.
// =============================================================


// -------------------------------------------------------------
//   Estados de reservas (espejo del ENUM en MySQL)
// -------------------------------------------------------------
//   IMPORTANTE: los valores DEBEN coincidir con el ENUM definido
//   en la BD (migracion 001_schema.sql). Cualquier cambio aca
//   tiene que hacerse tambien en el backend.
// -------------------------------------------------------------
export const ESTADOS = {
  PENDIENTE:   'Pendiente',
  CONFIRMADA:  'Confirmada',
  EN_CURSO:    'En curso',
  FINALIZADA:  'Finalizada',
  CANCELADA:   'Cancelada',
  NO_SHOW:     'No Show',
};


// -------------------------------------------------------------
//   Colores y estilos asociados a cada estado (UI)
// -------------------------------------------------------------
//   Cada estado tiene una clase de Tailwind que define cómo se
//   pinta su badge en la UI. Centralizar acá evita inconsistencias
//   entre PanelAdmin, MisReservas y Calendario.
// -------------------------------------------------------------
export const ESTILOS_ESTADO = {
  [ESTADOS.PENDIENTE]:  'bg-amber-100 text-amber-800 border-amber-200',
  [ESTADOS.CONFIRMADA]: 'bg-musgo-100 text-musgo-800 border-musgo-200',
  [ESTADOS.EN_CURSO]:   'bg-blue-100 text-blue-800 border-blue-200',
  [ESTADOS.FINALIZADA]: 'bg-piedra-200 text-piedra-800 border-piedra-300',
  [ESTADOS.CANCELADA]:  'bg-red-50 text-red-700 border-red-200',
  [ESTADOS.NO_SHOW]:    'bg-red-50 text-red-700 border-red-200',
};


// -------------------------------------------------------------
//   estadoEfectivo(reserva)
// -------------------------------------------------------------
//   Calcula el estado "real" de una reserva considerando la fecha
//   actual. Por ejemplo, una reserva Confirmada cuya fecha de
//   egreso ya pasó debería verse como Finalizada en la UI aunque
//   en BD siga como Confirmada (todavía no se ejecuto el check-out).
//
//   Para el backend conectado esto deberia minimizarse: los
//   estados en BD ya son la fuente de verdad. Lo dejo solo
//   por compatibilidad con vistas que muestran reservas sin
//   refrescar.
// -------------------------------------------------------------
export const estadoEfectivo = (reserva) => {
  if (!reserva) return null;
  if (reserva.estado === ESTADOS.CANCELADA || reserva.estado === ESTADOS.NO_SHOW) {
    return reserva.estado;
  }

  const hoy = new Date().toISOString().split('T')[0];
  // Las fechas vienen del backend como ISO con hora; tomamos solo la fecha
  const ingreso = (reserva.fecha_ingreso || '').slice(0, 10);
  const egreso  = (reserva.fecha_egreso  || '').slice(0, 10);

  if (reserva.estado === ESTADOS.PENDIENTE) {
    // Una pendiente cuya fecha de ingreso ya paso, se cancela
    if (ingreso < hoy) return ESTADOS.CANCELADA;
    return ESTADOS.PENDIENTE;
  }

  // Confirmada o Finalizada: calculamos segun fechas
  if (egreso < hoy) return ESTADOS.FINALIZADA;
  if (ingreso <= hoy && hoy <= egreso) return ESTADOS.EN_CURSO;
  return ESTADOS.CONFIRMADA;
};
