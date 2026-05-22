// =============================================================
//   TESTS — Adaptador de disponibilidad
// =============================================================

import { describe, test, expect } from 'vitest';
import { expandirRangosAFechas } from '../adaptadorDisponibilidad.js';


describe('expandirRangosAFechas', () => {

  test('array vacio devuelve array vacio', () => {
    expect(expandirRangosAFechas([])).toEqual([]);
  });

  test('null devuelve array vacio', () => {
    expect(expandirRangosAFechas(null)).toEqual([]);
  });

  test('un rango de 4 noches devuelve 4 fechas (ingreso inclusive, egreso exclusive)', () => {
    const rangos = [
      { id: 1, fecha_ingreso: '2027-06-01', fecha_egreso: '2027-06-05', estado: 'Confirmada' },
    ];
    const fechas = expandirRangosAFechas(rangos);
    expect(fechas).toHaveLength(4);
    expect(fechas[0].fecha).toBe('2027-06-01');
    expect(fechas[3].fecha).toBe('2027-06-04');
    expect(fechas[0].estado).toBe('Confirmada');
    expect(fechas[0].reservaId).toBe(1);
  });

  test('varios rangos se concatenan', () => {
    const rangos = [
      { id: 1, fecha_ingreso: '2027-06-01', fecha_egreso: '2027-06-03', estado: 'Pendiente' },
      { id: 2, fecha_ingreso: '2027-07-10', fecha_egreso: '2027-07-12', estado: 'Confirmada' },
    ];
    const fechas = expandirRangosAFechas(rangos);
    expect(fechas).toHaveLength(4);  // 2 + 2
    expect(fechas.find(f => f.fecha === '2027-06-01').estado).toBe('Pendiente');
    expect(fechas.find(f => f.fecha === '2027-07-10').estado).toBe('Confirmada');
  });
});
