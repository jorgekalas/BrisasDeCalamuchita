// =============================================================
//   HELPERS DE RESPUESTA JSON
// =============================================================
//   Todos los endpoints devuelven un JSON con el mismo formato:
//
//   Exito:
//     {
//       "exito": true,
//       "datos": <lo que sea>,
//       "metadata": { ... opcional ... }
//     }
//
//   Error:
//     {
//       "exito": false,
//       "error": {
//         "codigo": "VALIDACION_FALLIDA",
//         "mensaje": "El email no es valido",
//         "detalles": [ ... opcional ... ]
//       }
//     }
//
//   Esto le da consistencia al frontend: siempre puede chequear
//   `respuesta.exito` antes de leer `datos` o `error`.
// =============================================================


// -------------------------------------------------------------
//   exito(res, datos, opciones)
// -------------------------------------------------------------
//   Devuelve una respuesta 200 OK con datos.
//   `opciones` puede incluir:
//     - codigoHttp: para devolver 201, 204, etc.
//     - metadata: paginacion, totales, lo que necesite el front.
// -------------------------------------------------------------
export function exito(res, datos = null, opciones = {}) {
  const { codigoHttp = 200, metadata = null } = opciones;

  const respuesta = {
    exito: true,
    datos,
  };

  if (metadata) {
    respuesta.metadata = metadata;
  }

  return res.status(codigoHttp).json(respuesta);
}


// -------------------------------------------------------------
//   creado(res, datos)
// -------------------------------------------------------------
//   Atajo para 201 Created (despues de un POST exitoso).
// -------------------------------------------------------------
export function creado(res, datos = null) {
  return exito(res, datos, { codigoHttp: 201 });
}


// -------------------------------------------------------------
//   sinContenido(res)
// -------------------------------------------------------------
//   Atajo para 204 No Content (despues de DELETE exitoso).
// -------------------------------------------------------------
export function sinContenido(res) {
  return res.status(204).send();
}


// -------------------------------------------------------------
//   error(res, mensaje, opciones)
// -------------------------------------------------------------
//   Devuelve una respuesta de error formateada.
//   La usa principalmente el manejador centralizado, pero
//   tambien se puede usar en casos puntuales.
// -------------------------------------------------------------
export function error(res, mensaje, opciones = {}) {
  const {
    codigoHttp = 500,
    codigoNegocio = 'ERROR_INTERNO',
    detalles = null,
  } = opciones;

  const respuesta = {
    exito: false,
    error: {
      codigo: codigoNegocio,
      mensaje,
    },
  };

  if (detalles) {
    respuesta.error.detalles = detalles;
  }

  return res.status(codigoHttp).json(respuesta);
}
