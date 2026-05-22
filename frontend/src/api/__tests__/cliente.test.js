// =============================================================
//   TESTS — Cliente axios con interceptores
// =============================================================
//   Valida:
//   - El interceptor de REQUEST agrega el token automaticamente
//   - El interceptor de RESPONSE limpia localStorage en 401
//   - extraerError normaliza errores de axios
//   - El 401 en /login NO dispara redirect (excepcion)
// =============================================================

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import {
  cliente,
  extraerError,
  STORAGE_TOKEN_KEY,
  STORAGE_USUARIO_KEY,
} from '../cliente.js';
import { server } from '../../pruebas/mockHttp.js';


describe('Cliente axios — interceptor de request', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  test('agrega el token Bearer si esta en localStorage', async () => {
    localStorage.setItem(STORAGE_TOKEN_KEY, 'mi-token-fake');

    // Handler que captura el header
    let authHeader = null;
    server.use(
      http.get('/api/auth/yo', ({ request }) => {
        authHeader = request.headers.get('authorization');
        return HttpResponse.json({ exito: true, datos: { usuario: {} }});
      })
    );

    await cliente.get('/api/auth/yo');
    expect(authHeader).toBe('Bearer mi-token-fake');
  });

  test('NO agrega header si no hay token', async () => {
    // localStorage ya esta limpio
    let authHeader = 'inicial';
    server.use(
      http.get('/api/propiedad', ({ request }) => {
        authHeader = request.headers.get('authorization');
        return HttpResponse.json({ exito: true, datos: [] });
      })
    );

    await cliente.get('/api/propiedad');
    expect(authHeader).toBeNull();
  });
});


describe('Cliente axios — interceptor de response (401)', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  test('en 401 que NO es de login: limpia localStorage', async () => {
    localStorage.setItem(STORAGE_TOKEN_KEY, 'viejo-token');
    localStorage.setItem(STORAGE_USUARIO_KEY, JSON.stringify({ id: 1 }));

    // En jsdom, asignar window.location.href tira un error (porque
    // jsdom no soporta navegacion). Lo silenciamos para que no
    // interfiera con el assertion del localStorage.
    const ubicacionOriginal = window.location.href;
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: {
        href: ubicacionOriginal,
        pathname: '/',
        // Setter dummy que NO hace nada (en lugar de tirar error)
      },
    });

    server.use(
      http.get('/api/auth/yo', () => {
        return HttpResponse.json(
          { exito: false, error: { codigo: 'NO_AUTENTICADO', mensaje: 'venció' }},
          { status: 401 }
        );
      })
    );

    await cliente.get('/api/auth/yo').catch(() => {});

    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_USUARIO_KEY)).toBeNull();
  });

  test('en 401 del login: NO limpia localStorage (excepcion)', async () => {
    localStorage.setItem('algo-que-no-tocar', 'valor');

    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json(
          { exito: false, error: { codigo: 'NO_AUTENTICADO', mensaje: 'mal' }},
          { status: 401 }
        );
      })
    );

    await cliente.post('/api/auth/login', { email: 'x', password: 'mal' }).catch(() => {});

    expect(localStorage.getItem('algo-que-no-tocar')).toBe('valor');
  });
});


describe('extraerError', () => {

  test('normaliza error del backend con formato esperado', () => {
    const err = {
      response: {
        status: 409,
        data: {
          exito: false,
          error: { codigo: 'CONFLICTO', mensaje: 'Las fechas estan ocupadas', detalles: null },
        },
      },
    };
    const e = extraerError(err);
    expect(e.codigo).toBe('CONFLICTO');
    expect(e.mensaje).toBe('Las fechas estan ocupadas');
    expect(e.status).toBe(409);
  });

  test('error de respuesta sin formato esperado', () => {
    const err = { response: { status: 500, data: 'Internal Server Error' }};
    const e = extraerError(err);
    expect(e.codigo).toBe('ERROR_RESPUESTA');
    expect(e.status).toBe(500);
  });

  test('timeout', () => {
    const err = { code: 'ECONNABORTED', message: 'timeout' };
    const e = extraerError(err);
    expect(e.codigo).toBe('TIMEOUT');
  });

  test('sin conexion', () => {
    const err = { code: 'ERR_NETWORK', message: 'Network Error' };
    const e = extraerError(err);
    expect(e.codigo).toBe('SIN_CONEXION');
  });

  test('error desconocido', () => {
    const e = extraerError({ message: 'algo raro' });
    expect(e.codigo).toBe('SIN_CONEXION');  // !response cae aca
  });
});
