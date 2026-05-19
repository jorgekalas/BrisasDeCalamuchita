// =============================================================
//   CONTROLADOR — USUARIOS
// =============================================================

import * as usuarioServicio from '../servicios/usuarioServicio.js';
import { schemaActualizarPerfil } from '../validadores/recursosValidador.js';
import { exito } from '../utilidades/respuesta.js';
import {
  obtenerPaginacion,
  construirMetadata,
} from '../utilidades/paginacion.js';


// -------------------------------------------------------------
//   GET /api/usuarios — listar clientes (admin only)
// -------------------------------------------------------------
//   Por ahora solo lista clientes. Si en el futuro hay que
//   listar administradores, se agrega un endpoint aparte.
// -------------------------------------------------------------
export async function listar(req, res) {
  const { pagina, porPagina, offset } = obtenerPaginacion(req);

  const { usuarios, total } = await usuarioServicio.listarClientes({
    porPagina,
    offset,
  });

  return exito(res, usuarios, {
    metadata: construirMetadata(total, pagina, porPagina),
  });
}


// -------------------------------------------------------------
//   GET /api/usuarios/:id — detalle de un usuario (admin only)
// -------------------------------------------------------------
export async function obtener(req, res) {
  const id = Number(req.params.id);
  const usuario = await usuarioServicio.obtener(id);
  return exito(res, usuario);
}


// -------------------------------------------------------------
//   PUT /api/usuarios/yo — actualizar perfil propio
// -------------------------------------------------------------
//   El usuario logueado edita sus propios datos.
// -------------------------------------------------------------
export async function actualizarPerfilPropio(req, res) {
  const cambios = schemaActualizarPerfil.parse(req.body);
  const actualizado = await usuarioServicio.actualizarPerfilPropio(
    req.usuario.id,
    cambios
  );
  return exito(res, actualizado);
}
