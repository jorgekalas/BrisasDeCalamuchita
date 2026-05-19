// =============================================================
//   CONTROLADOR — AUTENTICACION
// =============================================================
//   Capa HTTP: recibe req/res, valida con Zod, llama al
//   servicio correspondiente, formatea la respuesta.
//
//   Los controladores NO tienen logica de negocio (eso vive
//   en los servicios) ni SQL (eso vive en los modelos).
//   Solo orquestan.
// =============================================================

import * as autServicio from '../servicios/autServicio.js';
import { schemaRegistro, schemaLogin } from '../validadores/autValidador.js';
import { exito, creado } from '../utilidades/respuesta.js';


// -------------------------------------------------------------
//   POST /api/auth/registro
// -------------------------------------------------------------
//   Registra un cliente nuevo. Solo crea clientes; los admins
//   se siembran por seed o se crean desde un endpoint protegido
//   (que vendra mas adelante).
//
//   Devuelve 201 Created con { usuario, token } para que el
//   cliente pueda auto-loguearse.
// -------------------------------------------------------------
export async function registrar(req, res) {
  // 1. Validar con Zod (tira ZodError si falla, lo captura el manejador)
  const datos = schemaRegistro.parse(req.body);

  // 2. Llamar al servicio
  const resultado = await autServicio.registrar(datos);

  // 3. Responder 201 Created
  return creado(res, resultado);
}


// -------------------------------------------------------------
//   POST /api/auth/login
// -------------------------------------------------------------
//   Devuelve 200 OK con { usuario, token } si las credenciales
//   son correctas; 401 si no.
// -------------------------------------------------------------
export async function login(req, res) {
  const datos = schemaLogin.parse(req.body);
  const resultado = await autServicio.login(datos);
  return exito(res, resultado);
}


// -------------------------------------------------------------
//   GET /api/auth/yo
// -------------------------------------------------------------
//   Devuelve los datos del usuario logueado.
//   El middleware requiereAuth ya cargo req.usuario.
// -------------------------------------------------------------
export async function yo(req, res) {
  // req.usuario lo seteo el middleware con datos frescos de la BD
  return exito(res, { usuario: req.usuario });
}
