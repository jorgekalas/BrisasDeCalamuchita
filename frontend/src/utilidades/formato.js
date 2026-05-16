/**
 * Utilidades de formato — Brisas de Calamuchita
 */

/**
 * Formatea una fecha "YYYY-MM-DD" o Date a "12 de mayo".
 */
export const formatearFecha = (fecha, opciones = {}) => {
  const d = typeof fecha === 'string' ? new Date(fecha + 'T12:00:00') : fecha;
  return d.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: opciones.conAnio ? 'numeric' : undefined,
  });
};

/**
 * Formatea una fecha mostrando siempre el año: "12 de mayo 2026".
 * Útil en listados y paneles donde el año es información importante.
 */
export const formatearFechaConAnio = (fecha) => {
  const d = typeof fecha === 'string' ? new Date(fecha + 'T12:00:00') : fecha;
  return d.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Formatea un rango de fechas de manera compacta.
 * Si ambas son del mismo año: "12 de mayo → 17 de mayo 2026"
 * Si son de años distintos:    "28 de diciembre 2026 → 3 de enero 2027"
 */
export const formatearRangoFechas = (ingreso, egreso) => {
  const di = new Date(ingreso + 'T12:00:00');
  const de = new Date(egreso + 'T12:00:00');
  if (di.getFullYear() === de.getFullYear()) {
    return `${formatearFecha(ingreso)} → ${formatearFechaConAnio(egreso)}`;
  }
  return `${formatearFechaConAnio(ingreso)} → ${formatearFechaConAnio(egreso)}`;
};

/**
 * Calcula la cantidad de noches entre dos fechas.
 */
export const calcularNoches = (ingreso, egreso) => {
  if (!ingreso || !egreso) return 0;
  const d1 = new Date(ingreso);
  const d2 = new Date(egreso);
  const ms = d2.getTime() - d1.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
};

/**
 * Formatea un precio en pesos argentinos.
 */
export const formatearPrecio = (numero) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(numero);
};

/**
 * Devuelve la fecha de hoy en formato YYYY-MM-DD.
 */
export const hoy = () => new Date().toISOString().split('T')[0];

/**
 * Genera un ID de reserva ficticio para la demo.
 */
export const generarIdReserva = () => {
  const numero = Math.floor(Math.random() * 9000) + 1000;
  const anio = new Date().getFullYear();
  return `RES-${anio}-${numero}`;
};

/**
 * Normaliza un número de teléfono a formato internacional para WhatsApp.
 * Acepta entradas como "+54 9 11 4444 5555", "11 4444 5555", "(011) 4444-5555".
 * Devuelve solo dígitos, anteponiendo el código de país argentino si falta.
 */
export const normalizarTelefono = (telefono) => {
  if (!telefono) return '';
  // Quita todo lo que no sea dígito
  let limpio = telefono.replace(/\D/g, '');
  // Si arranca con 54 lo dejamos; sino lo agregamos (asumimos Argentina)
  if (!limpio.startsWith('54')) limpio = '54' + limpio;
  return limpio;
};

/**
 * Construye una URL de WhatsApp con mensaje prearmado.
 * @param {string} telefono - Número en cualquier formato.
 * @param {string} mensaje - Texto a enviar (se URL-encodea).
 */
export const armarLinkWhatsApp = (telefono, mensaje) => {
  const numero = normalizarTelefono(telefono);
  const texto = encodeURIComponent(mensaje);
  return `https://wa.me/${numero}?text=${texto}`;
};
