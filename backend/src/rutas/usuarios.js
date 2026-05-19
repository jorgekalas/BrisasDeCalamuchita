// =============================================================
//   RUTAS — USUARIOS
// =============================================================
//   GET /api/usuarios       admin only, listado paginado
//   GET /api/usuarios/yo    auth requerida (alias para no confundir con :id)
//   PUT /api/usuarios/yo    auth requerida (editar perfil propio)
//   GET /api/usuarios/:id   admin only, detalle
//
//   IMPORTANTE: el orden importa. "/yo" debe ir ANTES que "/:id"
//   para que Express no lo interprete como un id.
// =============================================================

import { Router } from 'express';
import * as usuarioControlador from '../controladores/usuarioControlador.js';
import { yo as autYo } from '../controladores/autControlador.js';
import { requiereAuth } from '../middlewares/requiereAuth.js';
import { requiereAdmin } from '../middlewares/requiereAdmin.js';

export const rutasUsuarios = Router();

const async$ = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


// --- Mi perfil (lectura y edicion) ---
//   GET /yo es alias de /api/auth/yo, lo dejamos para que sea
//   mas intuitivo: "mis datos de usuario".
rutasUsuarios.get('/yo',
  requiereAuth,
  async$(autYo)
);

rutasUsuarios.put('/yo',
  requiereAuth,
  async$(usuarioControlador.actualizarPerfilPropio)
);


// --- Admin only ---
rutasUsuarios.get('/',
  requiereAuth,
  requiereAdmin,
  async$(usuarioControlador.listar)
);

rutasUsuarios.get('/:id',
  requiereAuth,
  requiereAdmin,
  async$(usuarioControlador.obtener)
);
