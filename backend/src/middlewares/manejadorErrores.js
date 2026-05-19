// =============================================================
//   MIDDLEWARE — MANEJADOR CENTRALIZADO DE ERRORES
// =============================================================
//   Captura cualquier error tirado desde un controlador o
//   middleware anterior y lo formatea uniformemente.
//
//   Tiene que ser el ULTIMO middleware registrado y tener
//   exactamente 4 parametros (error, req, res, next) para que
//   Express lo reconozca como manejador de errores.
// =============================================================

import { z } from 'zod';
import { error } from '../utilidades/respuesta.js';
import { ErrorApp } from '../utilidades/errores.js';
import { esDesarrollo } from '../config/env.js';


// eslint-disable-next-line no-unused-vars
export function manejadorErrores(err, req, res, _next) {
  // ---------------------------------------------------------
  //   Caso 1: error tipado de nuestra app (NoEncontrado, etc.)
  // ---------------------------------------------------------
  if (err instanceof ErrorApp) {
    return error(res, err.message, {
      codigoHttp: err.codigoHttp,
      codigoNegocio: err.codigoNegocio,
      detalles: err.detalles ?? null,
    });
  }

  // ---------------------------------------------------------
  //   Caso 2: error de validacion de Zod
  // ---------------------------------------------------------
  // Si en algun controlador hacemos schema.parse(req.body) y
  // los datos son invalidos, Zod tira un ZodError. Lo
  // transformamos en 400 con detalles utiles para el front.
  // ---------------------------------------------------------
  if (err instanceof z.ZodError) {
    const detalles = err.errors.map(e => ({
      campo: e.path.join('.'),
      mensaje: e.message,
    }));
    return error(res, 'Datos invalidos', {
      codigoHttp: 400,
      codigoNegocio: 'VALIDACION_FALLIDA',
      detalles,
    });
  }

  // ---------------------------------------------------------
  //   Caso 3: errores conocidos de MySQL
  // ---------------------------------------------------------
  // mysql2 tira errores con codigos especificos. Los mas
  // comunes los traducimos a respuestas amigables.
  // ---------------------------------------------------------
  if (err.code === 'ER_DUP_ENTRY') {
    return error(res, 'Ese registro ya existe', {
      codigoHttp: 409,
      codigoNegocio: 'DUPLICADO',
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return error(res, 'Referencia invalida o registro en uso', {
      codigoHttp: 409,
      codigoNegocio: 'FK_INVALIDA',
    });
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    return error(res, 'Servicio no disponible temporalmente', {
      codigoHttp: 503,
      codigoNegocio: 'BD_NO_DISPONIBLE',
    });
  }

  // ---------------------------------------------------------
  //   Caso 4: error inesperado (bug)
  // ---------------------------------------------------------
  // Cualquier otra cosa la consideramos un bug. NUNCA
  // exponemos el mensaje original al cliente en produccion
  // (puede tener info sensible). En desarrollo lo mostramos
  // completo para debugging.
  // ---------------------------------------------------------
  console.error('\n🔥 Error inesperado:', err);

  return error(res, esDesarrollo ? err.message : 'Error interno del servidor', {
    codigoHttp: 500,
    codigoNegocio: 'ERROR_INTERNO',
    detalles: esDesarrollo ? { stack: err.stack } : null,
  });
}
