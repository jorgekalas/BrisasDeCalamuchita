// =============================================================
//   SERVICIO — USUARIO
// =============================================================
//   Operaciones sobre usuarios MAS ALLA de autenticarse.
//   El servicio de auth (autServicio.js) tiene registrar/login;
//   este servicio tiene listar clientes (para admin) y editar
//   perfil propio.
// =============================================================

import * as usuarioModelo from '../modelos/usuarioModelo.js';
import { NoEncontrado } from '../utilidades/errores.js';


// -------------------------------------------------------------
//   Helper: limpiar password_hash de los resultados
// -------------------------------------------------------------
function limpiar(usuario) {
  if (!usuario) return null;
  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...publico } = usuario;
  return publico;
}


// -------------------------------------------------------------
//   Listar clientes (admin only)
// -------------------------------------------------------------
export async function listarClientes({ porPagina, offset }) {
  const { usuarios, total } = await usuarioModelo.listarPorTipo('cliente', {
    offset,
    limite: porPagina,
  });

  return {
    usuarios: usuarios.map(limpiar),
    total,
  };
}


// -------------------------------------------------------------
//   Obtener detalle de un usuario por ID (admin only)
// -------------------------------------------------------------
export async function obtener(id) {
  const usuario = await usuarioModelo.buscarPorId(id);
  if (!usuario) {
    throw new NoEncontrado('El usuario solicitado no existe');
  }
  return limpiar(usuario);
}


// -------------------------------------------------------------
//   Actualizar perfil propio
// -------------------------------------------------------------
//   El usuario logueado edita sus propios datos.
//   Solo campos del perfil (nombre, apellido, telefono, dni,
//   fecha_nacimiento). Email y password van por endpoints
//   especiales con validaciones extra.
// -------------------------------------------------------------
export async function actualizarPerfilPropio(usuarioId, cambios) {
  const actualizado = await usuarioModelo.actualizarPerfil(usuarioId, cambios);
  return limpiar(actualizado);
}
