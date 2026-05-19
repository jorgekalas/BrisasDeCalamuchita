// =============================================================
//   MIDDLEWARE — REQUIERE AUTENTICACION
// =============================================================
//   Lee el header `Authorization: Bearer <token>`, verifica
//   el JWT, busca el usuario fresco en BD y lo deja en
//   `req.usuario` para que los controladores lo usen.
//
//   Si el token es invalido, vencido o el usuario fue
//   eliminado, tira 401.
// =============================================================

import { verificarToken } from '../servicios/tokenServicio.js';
import * as autServicio from '../servicios/autServicio.js';
import { NoAutenticado } from '../utilidades/errores.js';


export async function requiereAuth(req, _res, next) {
  try {
    // 1. Buscar el header Authorization
    const header = req.headers.authorization || '';

    if (!header.startsWith('Bearer ')) {
      throw new NoAutenticado(
        'Falta el token de autenticación. Iniciá sesión primero.'
      );
    }

    const token = header.substring('Bearer '.length).trim();
    if (!token) {
      throw new NoAutenticado('Token vacío');
    }

    // 2. Verificar el JWT (tira NoAutenticado si es invalido)
    const payload = verificarToken(token);

    // 3. Buscar el usuario fresco en BD (no confiamos solo en el token)
    // Asi nos aseguramos que el usuario sigue existiendo, esta activo,
    // y traemos datos actualizados (nombre, telefono, etc.).
    const usuario = await autServicio.obtenerPorId(payload.id);

    if (!usuario.activo) {
      throw new NoAutenticado('Tu cuenta esta desactivada');
    }

    // 4. Dejar el usuario disponible para los controladores
    req.usuario = usuario;
    next();
  } catch (error) {
    next(error);
  }
}
