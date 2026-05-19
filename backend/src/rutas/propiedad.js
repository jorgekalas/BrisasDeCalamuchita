// =============================================================
//   RUTAS — PROPIEDAD
// =============================================================
//   GET    /api/propiedad        publico
//   GET    /api/propiedad/:id    publico
//   PUT    /api/propiedad/:id    admin only
// =============================================================

import { Router } from 'express';
import * as propiedadControlador from '../controladores/propiedadControlador.js';
import { requiereAuth } from '../middlewares/requiereAuth.js';
import { requiereAdmin } from '../middlewares/requiereAdmin.js';

export const rutasPropiedad = Router();

// Wrapper para que Express 4 propague errores async
const async$ = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


// --- Lectura publica ---
rutasPropiedad.get('/',    async$(propiedadControlador.listar));
rutasPropiedad.get('/:id', async$(propiedadControlador.obtener));

// --- Escritura solo admin ---
rutasPropiedad.put('/:id',
  requiereAuth,
  requiereAdmin,
  async$(propiedadControlador.actualizar)
);
