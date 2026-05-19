// =============================================================
//   RUTAS — RESERVAS
// =============================================================
//   GET /api/reservas                  admin only, con paginacion y filtro estado
//   GET /api/reservas/disponibilidad   publico (para el calendario)
//   GET /api/reservas/:id              auth requerida (admin o duenio)
//   GET /api/mis-reservas              auth requerida (lista del cliente)
//
//   IMPORTANTE: el orden de las rutas importa. /disponibilidad debe
//   ir ANTES que /:id para que Express no interprete "disponibilidad"
//   como un id.
// =============================================================

import { Router } from 'express';
import * as reservaControlador from '../controladores/reservaControlador.js';
import { requiereAuth } from '../middlewares/requiereAuth.js';
import { requiereAdmin } from '../middlewares/requiereAdmin.js';

export const rutasReservas = Router();

const async$ = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


// --- Endpoint publico ---
rutasReservas.get('/disponibilidad', async$(reservaControlador.disponibilidad));

// --- Listado solo admin (con paginacion y filtros) ---
rutasReservas.get('/',
  requiereAuth,
  requiereAdmin,
  async$(reservaControlador.listar)
);

// --- Detalle: admin puede ver cualquiera, cliente solo las suyas ---
// La autorizacion fina la hace el servicio (no el middleware) porque
// necesita saber a quien pertenece la reserva.
rutasReservas.get('/:id',
  requiereAuth,
  async$(reservaControlador.obtener)
);


// =============================================================
//   MAQUINA DE ESTADOS (Bloque 7)
// =============================================================

// --- Crear reserva (cliente logueado) ---
//   La validacion de que sea cliente (no admin) la hace el servicio,
//   porque necesita saber el tipo del usuario actual.
rutasReservas.post('/',
  requiereAuth,
  async$(reservaControlador.crear)
);

// --- Confirmar (solo admin) ---
rutasReservas.post('/:id/confirmar',
  requiereAuth,
  requiereAdmin,
  async$(reservaControlador.confirmar)
);

// --- Cancelar (cliente dueño o admin) ---
//   La autorizacion fina la hace el servicio, no el middleware.
rutasReservas.post('/:id/cancelar',
  requiereAuth,
  async$(reservaControlador.cancelar)
);

// --- Check-in (solo admin) ---
rutasReservas.post('/:id/check-in',
  requiereAuth,
  requiereAdmin,
  async$(reservaControlador.checkIn)
);

// --- Check-out (solo admin) ---
rutasReservas.post('/:id/check-out',
  requiereAuth,
  requiereAdmin,
  async$(reservaControlador.checkOut)
);


// =============================================================
//   Router separado para /api/mis-reservas
// =============================================================
//   Se monta en /api/mis-reservas en app.js. Un router distinto
//   porque la URL base es diferente.
// =============================================================
export const rutasMisReservas = Router();

rutasMisReservas.get('/',
  requiereAuth,
  async$(reservaControlador.misReservas)
);
