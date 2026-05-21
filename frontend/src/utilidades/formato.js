/**
 * Utilidades de formato — Brisas de Calamuchita
 */


/**
 * Normaliza una entrada de fecha a un objeto Date.
 *
 * Acepta tres formatos:
 *   1. Date object (devuelve tal cual)
 *   2. String corto "YYYY-MM-DD" (le agrega T12:00:00 hora local para
 *      evitar problemas de zona horaria, asi un 2027-06-01 se ve como
 *      1 de junio y no como 31 de mayo en GMT-3)
 *   3. String ISO completo "2027-06-01T03:00:00.000Z" (lo parsea directo,
 *      es como viene del backend cuando mysql2 devuelve un DATE)
 */
const aDate = (fecha) => {
  if (fecha instanceof Date) return fecha;
  if (typeof fecha !== 'string' || !fecha) return new Date(NaN);

  // Si tiene T (es un ISO completo), lo parseamos tal cual
  if (fecha.includes('T')) return new Date(fecha);

  // Si es solo "YYYY-MM-DD", le agregamos mediodia para evitar
  // que el offset de zona horaria nos mande al dia anterior
  return new Date(fecha + 'T12:00:00');
};


/**
 * Formatea una fecha "YYYY-MM-DD" o Date a "12 de mayo".
 */
export const formatearFecha = (fecha, opciones = {}) => {
  const d = aDate(fecha);
  if (isNaN(d)) return '—';
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
  const d = aDate(fecha);
  if (isNaN(d)) return '—';
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
  const di = aDate(ingreso);
  const de = aDate(egreso);
  if (isNaN(di) || isNaN(de)) return '— → —';
  if (di.getFullYear() === de.getFullYear()) {
    return `${formatearFecha(ingreso)} → ${formatearFechaConAnio(egreso)}`;
  }
  return `${formatearFechaConAnio(ingreso)} → ${formatearFechaConAnio(egreso)}`;
};


/**
 * Calcula la cantidad de noches entre dos fechas.
 *
 * Para evitar errores por zona horaria, usamos el aDate normalizado
 * y luego truncamos a dia (sin hora) para que la diferencia sea
 * exacta en dias completos.
 */
export const calcularNoches = (ingreso, egreso) => {
  if (!ingreso || !egreso) return 0;
  const d1 = aDate(ingreso);
  const d2 = aDate(egreso);
  if (isNaN(d1) || isNaN(d2)) return 0;

  // Trunco a medianoche para que la diferencia sea en dias enteros
  const m1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const m2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  const ms = m2.getTime() - m1.getTime();
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
