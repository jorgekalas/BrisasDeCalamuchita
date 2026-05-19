// =============================================================
//   SERVICIO — TOKENS (JWT)
// =============================================================
//   Generacion y verificacion de JSON Web Tokens.
//
//   El token contiene SOLO el id y el tipo del usuario. Cualquier
//   otra info se busca en la BD cada vez (datos frescos siempre).
//   Asi evitamos tokens grandes y datos desactualizados.
//
//   Estructura del payload:
//     { id: 1, tipo: 'cliente' | 'administrador', iat: ..., exp: ... }
// =============================================================

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { NoAutenticado } from '../utilidades/errores.js';


// -------------------------------------------------------------
//   Generar token
// -------------------------------------------------------------
export function generarToken(usuario) {
  if (!env.JWT_SECRETO) {
    throw new Error(
      'JWT_SECRETO no esta configurado en el .env. ' +
      'Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
    );
  }

  const payload = {
    id: usuario.id,
    tipo: usuario.tipo,
  };

  return jwt.sign(payload, env.JWT_SECRETO, {
    expiresIn: env.JWT_EXPIRACION,
    issuer: 'brisas-calamuchita',
  });
}


// -------------------------------------------------------------
//   Verificar token
// -------------------------------------------------------------
//   Si el token es valido devuelve el payload decodificado.
//   Si no, tira NoAutenticado con mensaje especifico segun
//   el motivo del fallo (vencido vs invalido).
// -------------------------------------------------------------
export function verificarToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRETO, {
      issuer: 'brisas-calamuchita',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new NoAutenticado('Tu sesion expiro, volve a iniciar sesion');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new NoAutenticado('Token invalido');
    }
    throw new NoAutenticado('No se pudo verificar el token');
  }
}
