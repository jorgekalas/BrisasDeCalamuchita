// =============================================================
//   HELPER — PAGINACION
// =============================================================
//   Toma los query params `?pagina=X&porPagina=Y` y devuelve un
//   objeto normalizado y validado, listo para usar en queries SQL.
//
//   Uso desde un controlador:
//     const { pagina, porPagina, offset } = obtenerPaginacion(req);
//     const filas = await modelo.listar({ ..., offset, limite: porPagina });
// =============================================================

import { z } from 'zod';

const schemaPaginacion = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  porPagina: z.coerce.number().int().positive().max(100).default(10),
});


// -------------------------------------------------------------
//   obtenerPaginacion(req) → { pagina, porPagina, offset }
// -------------------------------------------------------------
//   Lee de req.query.pagina y req.query.porPagina, los valida
//   con Zod, y calcula el offset para SQL.
//
//   Valores por defecto: pagina=1, porPagina=10.
//   Limite maximo: porPagina=100 (para evitar que alguien pida
//   ?porPagina=99999999 y nos haga renegar a la BD).
// -------------------------------------------------------------
export function obtenerPaginacion(req) {
  const { pagina, porPagina } = schemaPaginacion.parse({
    pagina: req.query.pagina,
    porPagina: req.query.porPagina,
  });

  return {
    pagina,
    porPagina,
    offset: (pagina - 1) * porPagina,
  };
}


// -------------------------------------------------------------
//   construirMetadata(totalFilas, pagina, porPagina)
// -------------------------------------------------------------
//   Arma el objeto `metadata` que va dentro de la respuesta
//   junto con los datos paginados.
//
//   Se usa asi en un controlador:
//     return exito(res, filas, { metadata: construirMetadata(...) });
// -------------------------------------------------------------
export function construirMetadata(totalFilas, pagina, porPagina) {
  const totalPaginas = Math.ceil(totalFilas / porPagina) || 1;
  return {
    paginacion: {
      pagina,
      porPagina,
      total: totalFilas,
      totalPaginas,
      hayProxima: pagina < totalPaginas,
      hayAnterior: pagina > 1,
    },
  };
}
