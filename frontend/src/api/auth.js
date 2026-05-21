// =============================================================
//   API — AUTENTICACION
// =============================================================
//   Endpoints:
//     POST /api/auth/registro
//     POST /api/auth/login
//     GET  /api/auth/yo
//
//   Cada funcion devuelve directamente los datos (no la
//   respuesta completa de axios). Los errores se propagan como
//   excepciones para que los componentes los capturen con try.
// =============================================================

import { cliente } from './cliente.js';


// -------------------------------------------------------------
//   POST /api/auth/registro
// -------------------------------------------------------------
//   Crea un cliente nuevo. Devuelve { usuario, token } para
//   permitir auto-login despues del registro.
// -------------------------------------------------------------
export async function registrar(datos) {
  const { data } = await cliente.post('/api/auth/registro', datos);
  return data.datos;  // { usuario, token }
}


// -------------------------------------------------------------
//   POST /api/auth/login
// -------------------------------------------------------------
export async function login({ email, password }) {
  const { data } = await cliente.post('/api/auth/login', { email, password });
  return data.datos;  // { usuario, token }
}


// -------------------------------------------------------------
//   GET /api/auth/yo
// -------------------------------------------------------------
//   Obtiene los datos del usuario logueado (segun el token actual).
//   Util para refrescar datos despues de modificaciones.
// -------------------------------------------------------------
export async function obtenerYo() {
  const { data } = await cliente.get('/api/auth/yo');
  return data.datos.usuario;
}
