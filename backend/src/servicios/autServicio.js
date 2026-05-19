// =============================================================
//   SERVICIO — AUTENTICACION
// =============================================================
//   Logica de negocio para registro, login y obtencion del
//   usuario actual. No toca HTTP (eso lo hace el controlador)
//   ni SQL directo (eso lo hace el modelo).
//
//   Aca viven las reglas: "el email no puede estar duplicado",
//   "la password se hashea con cost 10", "el usuario debe
//   estar activo para loguearse", etc.
// =============================================================

import bcrypt from 'bcrypt';
import * as usuarioModelo from '../modelos/usuarioModelo.js';
import { generarToken } from './tokenServicio.js';
import {
  Conflicto,
  NoAutenticado,
  NoEncontrado,
} from '../utilidades/errores.js';


// -------------------------------------------------------------
//   Configuracion
// -------------------------------------------------------------
const BCRYPT_RONDAS = 10;


// -------------------------------------------------------------
//   Limpiar password_hash de un objeto usuario
// -------------------------------------------------------------
//   Nunca devolvemos el hash al cliente, ni siquiera bajo
//   HTTPS. Esta funcion lo elimina antes de responder.
// -------------------------------------------------------------
function limpiarUsuario(usuario) {
  if (!usuario) return null;
  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...usuarioPublico } = usuario;
  return usuarioPublico;
}


// -------------------------------------------------------------
//   Registrar cliente nuevo
// -------------------------------------------------------------
//   1. Validar que el email no este registrado (devolver 409 si si)
//   2. Hashear el password con bcrypt cost 10
//   3. Crear el usuario + cliente en transaccion (lo hace el modelo)
//   4. Generar JWT para auto-login
//   5. Devolver usuario + token
// -------------------------------------------------------------
export async function registrar(datos) {
  // 1. Email unico
  const yaExiste = await usuarioModelo.existeEmail(datos.email);
  if (yaExiste) {
    throw new Conflicto(
      'Ya existe una cuenta con ese email. Probá iniciando sesión.'
    );
  }

  // 2. Hashear el password
  const password_hash = await bcrypt.hash(datos.password, BCRYPT_RONDAS);

  // 3. Crear el usuario + cliente (transaccion adentro del modelo)
  const usuarioCreado = await usuarioModelo.crearCliente({
    email: datos.email,
    password_hash,
    nombre: datos.nombre,
    apellido: datos.apellido,
    telefono: datos.telefono,
    dni: datos.dni,
    fecha_nacimiento: datos.fecha_nacimiento,
  });

  // 4. Generar token para auto-login
  const token = generarToken(usuarioCreado);

  // 5. Devolver usuario limpio + token
  return {
    usuario: limpiarUsuario(usuarioCreado),
    token,
  };
}


// -------------------------------------------------------------
//   Iniciar sesion
// -------------------------------------------------------------
//   1. Buscar usuario por email
//   2. Comparar password con bcrypt
//   3. Verificar que el usuario este activo
//   4. Generar JWT
//   5. Devolver usuario + token
//
//   Importante: el mismo mensaje de error para "email no existe"
//   y "password incorrecto". Asi un atacante no puede descubrir
//   que emails estan registrados intentando logins.
// -------------------------------------------------------------
export async function login({ email, password }) {
  const usuario = await usuarioModelo.buscarPorEmail(email);

  // Mensaje generico a proposito (no decimos si fallo email o password)
  const credencialesInvalidas = new NoAutenticado(
    'Email o contraseña incorrectos'
  );

  if (!usuario) {
    // Igual hacemos un compare dummy para evitar timing attacks
    // (que el atacante mida cuanto tarda la respuesta para descubrir
    // si el email existe o no).
    await bcrypt.compare(password, '$2b$10$invalidhashtoavoidTimingAttacks........................');
    throw credencialesInvalidas;
  }

  const passwordOk = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordOk) {
    throw credencialesInvalidas;
  }

  if (!usuario.activo) {
    throw new NoAutenticado(
      'Tu cuenta está desactivada. Comunicate con soporte.'
    );
  }

  const token = generarToken(usuario);

  return {
    usuario: limpiarUsuario(usuario),
    token,
  };
}


// -------------------------------------------------------------
//   Obtener datos del usuario por id (usado en GET /yo)
// -------------------------------------------------------------
export async function obtenerPorId(id) {
  const usuario = await usuarioModelo.buscarPorId(id);
  if (!usuario) {
    throw new NoEncontrado('Usuario no encontrado');
  }
  // buscarPorId ya no devuelve password_hash, pero por las dudas:
  return limpiarUsuario(usuario);
}
