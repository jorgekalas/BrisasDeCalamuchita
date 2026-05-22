// =============================================================
//   TESTS — Helper de formato de fechas
// =============================================================

import { describe, test, expect } from 'vitest';
import {
  formatearFecha,
  formatearFechaConAnio,
  formatearRangoFechas,
  calcularNoches,
  formatearPrecio,
  hoy,
  normalizarTelefono,
  armarLinkWhatsApp,
} from '../formato.js';


describe('formatearFecha', () => {
  test('acepta string ISO completo (formato del backend)', () => {
    const r = formatearFecha('2027-06-01T03:00:00.000Z');
    expect(r).toBe('1 de junio');
  });

  test('acepta string corto YYYY-MM-DD (formato legacy)', () => {
    const r = formatearFecha('2027-06-01');
    expect(r).toBe('1 de junio');
  });

  test('acepta Date object', () => {
    const r = formatearFecha(new Date(2027, 2, 15, 12, 0, 0));
    expect(r).toBe('15 de marzo');
  });

  test('null devuelve raya', () => {
    expect(formatearFecha(null)).toBe('—');
  });

  test('undefined devuelve raya', () => {
    expect(formatearFecha(undefined)).toBe('—');
  });

  test('string invalido devuelve raya', () => {
    expect(formatearFecha('no es fecha')).toBe('—');
  });
});


describe('formatearFechaConAnio', () => {
  test('incluye el anio', () => {
    expect(formatearFechaConAnio('2027-06-05')).toMatch(/5 de junio.*2027/);
  });
});


describe('formatearRangoFechas', () => {
  test('mismo anio: muestra anio solo en la segunda', () => {
    const r = formatearRangoFechas('2027-06-01', '2027-06-05');
    expect(r).toMatch(/1 de junio.*→.*5 de junio.*2027/);
  });

  test('fechas invalidas: devuelve em dashes', () => {
    expect(formatearRangoFechas(null, null)).toBe('— → —');
  });
});


describe('calcularNoches', () => {
  test('4 noches entre lunes y viernes', () => {
    expect(calcularNoches('2027-06-01', '2027-06-05')).toBe(4);
  });

  test('formato ISO funciona igual', () => {
    expect(calcularNoches('2027-06-01T03:00:00.000Z', '2027-06-05T03:00:00.000Z')).toBe(4);
  });

  test('null devuelve 0', () => {
    expect(calcularNoches(null, null)).toBe(0);
  });

  test('misma fecha: 0 noches', () => {
    expect(calcularNoches('2027-06-01', '2027-06-01')).toBe(0);
  });
});


describe('formatearPrecio', () => {
  test('formato pesos argentinos', () => {
    const r = formatearPrecio(85000);
    // Locale: "$85.000" (con punto como separador de miles en es-AR)
    expect(r).toContain('85.000');
    expect(r).toContain('$');
  });

  test('sin decimales', () => {
    const r = formatearPrecio(85000.99);
    expect(r).not.toContain(',9');
    expect(r).not.toContain('.99');
  });
});


describe('hoy', () => {
  test('devuelve formato YYYY-MM-DD', () => {
    expect(hoy()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});


describe('normalizarTelefono', () => {
  test('agrega 54 si no estaba', () => {
    expect(normalizarTelefono('3546528237')).toBe('543546528237');
  });

  test('no duplica 54 si ya empezaba con 54', () => {
    expect(normalizarTelefono('+54 9 3546 52-8237')).toBe('5493546528237');
  });

  test('null devuelve string vacio', () => {
    expect(normalizarTelefono(null)).toBe('');
  });
});


describe('armarLinkWhatsApp', () => {
  test('arma URL wa.me con mensaje encodeado', () => {
    const url = armarLinkWhatsApp('+5493546528237', 'Hola Maria');
    expect(url).toContain('https://wa.me/5493546528237');
    expect(url).toContain('Hola%20Maria');
  });
});
