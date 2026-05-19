// =============================================================
//   RUTAS — AUTENTICACION
// =============================================================
//   Define los endpoints de auth y los conecta con sus
//   controladores y middlewares.
//
//   Endpoints:
//     POST /api/auth/registro  → publico, crea cliente
//     POST /api/auth/login     → publico, devuelve JWT
//     GET  /api/auth/yo        → privado, datos del usuario actual
// =============================================================

import { Router } from 'express';
import * as autControlador from '../controladores/autControlador.js';
import { requiereAuth } from '../middlewares/requiereAuth.js';

export const rutasAuth = Router();


// -------------------------------------------------------------
//   Wrapper para controladores async
// -------------------------------------------------------------
//   Express 4 no maneja bien las promesas: si un async tira un
//   error, el manejador centralizado no lo recibe. Este wrapper
//   captura cualquier rejection y la pasa a next().
//
//   En Express 5 (cuando lo migremos) esto ya no es necesario.
// -------------------------------------------------------------
const async$ = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


// -------------------------------------------------------------
//   Rutas publicas
// -------------------------------------------------------------
rutasAuth.post('/registro', async$(autControlador.registrar));
rutasAuth.post('/login',    async$(autControlador.login));


// -------------------------------------------------------------
//   Rutas privadas (requieren JWT valido)
// -------------------------------------------------------------
rutasAuth.get('/yo', requiereAuth, async$(autControlador.yo));
