// =============================================================
//   RUTA — SALUD (healthcheck)
// =============================================================
//   GET /api/salud
//   Verifica que el servidor esta vivo Y que la BD responde.
//   Util para:
//     - Verificar deploys (Railway, Vercel, k8s, etc.)
//     - Monitoreo automatizado (uptime checks)
//     - Defender el coloquio mostrando que esta todo conectado
// =============================================================

import { Router } from 'express';
import { probarConexion } from '../config/bd.js';
import { exito, error } from '../utilidades/respuesta.js';
import { env } from '../config/env.js';

export const rutasSalud = Router();


// -------------------------------------------------------------
//   GET /api/salud
// -------------------------------------------------------------
rutasSalud.get('/', async (_req, res) => {
  const resultado = await probarConexion();

  if (!resultado.ok) {
    return error(res, 'Base de datos no disponible', {
      codigoHttp: 503,
      codigoNegocio: 'BD_NO_DISPONIBLE',
      detalles: {
        bd: 'caida',
        razon: resultado.error,
        codigo: resultado.codigo,
      },
    });
  }

  return exito(res, {
    servidor: 'ok',
    bd: 'ok',
    entorno: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
});
