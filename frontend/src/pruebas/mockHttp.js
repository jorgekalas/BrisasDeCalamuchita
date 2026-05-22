// =============================================================
//   MOCK HTTP — Handlers de MSW
// =============================================================
//   Define las respuestas que MSW devuelve cuando el frontend
//   hace requests a /api/*. Usamos esto en tests para simular
//   el backend sin levantarlo.
//
//   Los tests pueden:
//   - Usar los handlers default (escenario "todo OK")
//   - Sobreescribir con server.use(http.post(...)) para casos especificos
//     (errores, datos vacios, latencia)
// =============================================================

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';


// -------------------------------------------------------------
//   Datos de prueba
// -------------------------------------------------------------
const USUARIOS = {
  'maria@ejemplo.com': {
    id: 2, email: 'maria@ejemplo.com', nombre: 'María', apellido: 'Fernández',
    telefono: '+54 9 351 555 1234', tipo: 'cliente', dni: '32145678',
  },
  'admin@brisas.com.ar': {
    id: 1, email: 'admin@brisas.com.ar', nombre: 'Jorge', apellido: 'Kalas',
    telefono: '+54 9', tipo: 'administrador', nivel_acceso: 'total',
  },
};
const PASSWORDS = {
  'maria@ejemplo.com': 'demo1234',
  'admin@brisas.com.ar': 'demo1234',
};

const TOKEN_MARIA = 'token-maria-de-prueba';
const TOKEN_ADMIN = 'token-admin-de-prueba';

const PROPIEDAD_MOCK = {
  id: 1,
  nombre: 'Brisas de Calamuchita',
  ubicacion: 'Santa Rosa de Calamuchita, Córdoba',
  direccion: 'Malvinas Argentinas 189',
  latitud: -32.073353,
  longitud: -64.538835,
  descripcion: 'Casa serrana',
  precio_por_noche: '85000.00',
  capacidad_minima: 4,
  capacidad_maxima: 10,
  activa: 1,
};

const RESERVA_MOCK = {
  id: 1,
  fecha_ingreso: '2027-06-01T03:00:00.000Z',
  fecha_egreso:  '2027-06-05T03:00:00.000Z',
  cantidad_huespedes: 5,
  estado: 'Pendiente',
  observaciones: null,
  bloqueo_hasta: '2099-01-01T00:00:00.000Z',
  confirmada_en: null,
  cliente: { id: 2, nombre: 'María', apellido: 'Fernández', email: 'maria@ejemplo.com', telefono: '+54' },
  pago: null,
  vehiculo: null,
};


// -------------------------------------------------------------
//   Handlers default
// -------------------------------------------------------------
export const handlers = [

  // ---- AUTH ----
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    if (!USUARIOS[email] || PASSWORDS[email] !== password) {
      return HttpResponse.json(
        { exito: false, error: { codigo: 'NO_AUTENTICADO', mensaje: 'Credenciales invalidas' }},
        { status: 401 }
      );
    }
    const token = email === 'admin@brisas.com.ar' ? TOKEN_ADMIN : TOKEN_MARIA;
    return HttpResponse.json({
      exito: true,
      datos: { usuario: USUARIOS[email], token },
    });
  }),

  http.post('/api/auth/registro', async ({ request }) => {
    const datos = await request.json();
    if (USUARIOS[datos.email]) {
      return HttpResponse.json(
        { exito: false, error: { codigo: 'CONFLICTO', mensaje: 'Email ya registrado' }},
        { status: 409 }
      );
    }
    if (datos.password.length < 8) {
      return HttpResponse.json(
        { exito: false, error: { codigo: 'VALIDACION_FALLIDA', mensaje: 'Datos invalidos', detalles: [{ campo: 'password', mensaje: 'Min 8 caracteres' }] }},
        { status: 400 }
      );
    }
    const nuevo = { id: 99, ...datos, tipo: 'cliente' };
    delete nuevo.password;
    return HttpResponse.json(
      { exito: true, datos: { usuario: nuevo, token: 'token-nuevo-usuario' }},
      { status: 201 }
    );
  }),

  http.get('/api/auth/yo', ({ request }) => {
    const auth = request.headers.get('authorization');
    if (auth === `Bearer ${TOKEN_MARIA}`) {
      return HttpResponse.json({ exito: true, datos: { usuario: USUARIOS['maria@ejemplo.com'] }});
    }
    if (auth === `Bearer ${TOKEN_ADMIN}`) {
      return HttpResponse.json({ exito: true, datos: { usuario: USUARIOS['admin@brisas.com.ar'] }});
    }
    return HttpResponse.json(
      { exito: false, error: { codigo: 'NO_AUTENTICADO', mensaje: 'Sin token valido' }},
      { status: 401 }
    );
  }),

  // ---- PROPIEDAD ----
  http.get('/api/propiedad', () => {
    return HttpResponse.json({ exito: true, datos: [PROPIEDAD_MOCK] });
  }),

  http.get('/api/propiedad/:id', ({ params }) => {
    if (params.id === '1') {
      return HttpResponse.json({ exito: true, datos: PROPIEDAD_MOCK });
    }
    return HttpResponse.json(
      { exito: false, error: { codigo: 'NO_ENCONTRADO', mensaje: 'No existe' }},
      { status: 404 }
    );
  }),

  // ---- DISPONIBILIDAD ----
  http.get('/api/reservas/disponibilidad', () => {
    return HttpResponse.json({
      exito: true,
      datos: [
        { id: 1, fecha_ingreso: '2027-06-01', fecha_egreso: '2027-06-05', estado: 'Pendiente' },
        { id: 2, fecha_ingreso: '2027-07-10', fecha_egreso: '2027-07-15', estado: 'Confirmada' },
      ],
    });
  }),

  // ---- RESERVAS ----
  http.get('/api/mis-reservas', ({ request }) => {
    const auth = request.headers.get('authorization');
    if (!auth) return HttpResponse.json({ exito: false }, { status: 401 });
    return HttpResponse.json({
      exito: true,
      datos: [RESERVA_MOCK],
      metadata: { paginacion: { pagina: 1, porPagina: 20, total: 1, totalPaginas: 1, hayProxima: false, hayAnterior: false }},
    });
  }),

  http.get('/api/reservas', ({ request }) => {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${TOKEN_ADMIN}`) {
      return HttpResponse.json({ exito: false }, { status: 403 });
    }
    return HttpResponse.json({
      exito: true,
      datos: [RESERVA_MOCK],
      metadata: { paginacion: { pagina: 1, porPagina: 10, total: 1, totalPaginas: 1, hayProxima: false, hayAnterior: false }},
    });
  }),

  http.get('/api/reservas/:id', () => {
    return HttpResponse.json({ exito: true, datos: RESERVA_MOCK });
  }),

  http.post('/api/reservas', async ({ request }) => {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${TOKEN_MARIA}`) {
      return HttpResponse.json({ exito: false }, { status: 401 });
    }
    const datos = await request.json();
    return HttpResponse.json(
      {
        exito: true,
        datos: { ...RESERVA_MOCK, ...datos, id: 99 },
      },
      { status: 201 }
    );
  }),

  http.post('/api/reservas/:id/confirmar', () => {
    return HttpResponse.json({
      exito: true,
      datos: { ...RESERVA_MOCK, estado: 'Confirmada', bloqueo_hasta: null },
    });
  }),

  http.post('/api/reservas/:id/cancelar', () => {
    return HttpResponse.json({
      exito: true,
      datos: { ...RESERVA_MOCK, estado: 'Cancelada' },
    });
  }),

  http.post('/api/reservas/:id/check-in', () => {
    return HttpResponse.json({
      exito: true,
      datos: { ...RESERVA_MOCK, estado: 'En curso' },
    });
  }),

  http.post('/api/reservas/:id/check-out', () => {
    return HttpResponse.json({
      exito: true,
      datos: { ...RESERVA_MOCK, estado: 'Finalizada' },
    });
  }),
];


// -------------------------------------------------------------
//   Server de MSW (lo arrancan los setup files)
// -------------------------------------------------------------
export const server = setupServer(...handlers);
