// =============================================================
//   TESTS — Hook useApi
// =============================================================

import { describe, test, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from '../useApi.js';


describe('useApi', () => {

  test('estado inicial: cargando=true, datos=null, error=null', () => {
    const fn = vi.fn(() => new Promise(() => {}));  // promesa que nunca resuelve
    const { result } = renderHook(() => useApi(fn));

    expect(result.current.cargando).toBe(true);
    expect(result.current.datos).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('funcion async exitosa: cargando=false, datos contiene el resultado', async () => {
    const fn = vi.fn(async () => ({ algo: 'valor' }));
    const { result } = renderHook(() => useApi(fn));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });
    expect(result.current.datos).toEqual({ algo: 'valor' });
    expect(result.current.error).toBeNull();
  });

  test('funcion que tira error: cargando=false, error normalizado', async () => {
    const fn = vi.fn(async () => {
      throw { code: 'ERR_NETWORK', message: 'sin red' };
    });
    const { result } = renderHook(() => useApi(fn));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });
    expect(result.current.error).toBeTruthy();
    expect(result.current.error.codigo).toBe('SIN_CONEXION');
  });

  test('recargar() vuelve a llamar a la funcion', async () => {
    let contador = 0;
    const fn = vi.fn(async () => ({ contador: ++contador }));

    const { result } = renderHook(() => useApi(fn));
    await waitFor(() => expect(result.current.cargando).toBe(false));

    expect(result.current.datos.contador).toBe(1);

    // Llamar a recargar
    result.current.recargar();

    await waitFor(() => {
      expect(result.current.datos?.contador).toBe(2);
    });
  });
});
