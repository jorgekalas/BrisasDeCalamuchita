// =============================================================
//   TESTS UNITARIOS — Helper de paginacion
// =============================================================

import { jest } from '@jest/globals';
import { obtenerPaginacion, construirMetadata } from '../../src/utilidades/paginacion.js';


describe('obtenerPaginacion', () => {
  test('usa defaults si no hay query params', () => {
    const req = { query: {} };
    const r = obtenerPaginacion(req);
    expect(r).toEqual({ pagina: 1, porPagina: 10, offset: 0 });
  });

  test('parsea correctamente valores del query', () => {
    const req = { query: { pagina: '3', porPagina: '5' } };
    const r = obtenerPaginacion(req);
    expect(r).toEqual({ pagina: 3, porPagina: 5, offset: 10 });
  });

  test('calcula offset correctamente', () => {
    const req = { query: { pagina: '5', porPagina: '20' } };
    const r = obtenerPaginacion(req);
    expect(r.offset).toBe(80);  // (5-1) * 20
  });

  test('falla con pagina <= 0', () => {
    const req = { query: { pagina: '0' } };
    expect(() => obtenerPaginacion(req)).toThrow();
  });

  test('falla con porPagina > 100', () => {
    const req = { query: { porPagina: '200' } };
    expect(() => obtenerPaginacion(req)).toThrow();
  });

  test('falla con valores no numericos', () => {
    const req = { query: { pagina: 'hola' } };
    expect(() => obtenerPaginacion(req)).toThrow();
  });
});


describe('construirMetadata', () => {
  test('total 0 devuelve totalPaginas 1', () => {
    const m = construirMetadata(0, 1, 10);
    expect(m.paginacion.totalPaginas).toBe(1);
    expect(m.paginacion.total).toBe(0);
  });

  test('calcula totalPaginas correctamente', () => {
    const m = construirMetadata(25, 1, 10);
    expect(m.paginacion.totalPaginas).toBe(3);  // 25/10 = 3
  });

  test('en pagina 1 NO hay anterior', () => {
    const m = construirMetadata(50, 1, 10);
    expect(m.paginacion.hayAnterior).toBe(false);
    expect(m.paginacion.hayProxima).toBe(true);
  });

  test('en ultima pagina NO hay proxima', () => {
    const m = construirMetadata(30, 3, 10);
    expect(m.paginacion.hayProxima).toBe(false);
    expect(m.paginacion.hayAnterior).toBe(true);
  });

  test('en pagina del medio hay ambas', () => {
    const m = construirMetadata(50, 3, 10);
    expect(m.paginacion.hayAnterior).toBe(true);
    expect(m.paginacion.hayProxima).toBe(true);
  });
});
