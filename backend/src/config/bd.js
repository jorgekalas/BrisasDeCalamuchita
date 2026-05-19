// =============================================================
//   POOL DE CONEXIONES A MYSQL
// =============================================================
//   Crea un pool de conexiones reutilizable a la BD. Es mucho
//   mas eficiente que abrir/cerrar una conexion por cada query:
//   el pool mantiene N conexiones abiertas y las va prestando.
//
//   Uso desde el resto del codigo:
//     import { pool } from './config/bd.js';
//     const [filas] = await pool.query('SELECT * FROM usuario');
//
//   Para transacciones (Bloque 7+):
//     const conexion = await pool.getConnection();
//     await conexion.beginTransaction();
//     ...
//     conexion.release();
// =============================================================

import mysql from 'mysql2/promise';
import { env } from './env.js';


// -------------------------------------------------------------
//   Pool
// -------------------------------------------------------------
export const pool = mysql.createPool({
  host: env.BD_HOST,
  port: env.BD_PUERTO,
  user: env.BD_USUARIO,
  password: env.BD_PASSWORD,
  database: env.BD_NOMBRE,

  // --- Tuning del pool ---
  // connectionLimit: cantidad maxima de conexiones simultaneas.
  // Para desarrollo 10 alcanza y sobra; en produccion ajustar.
  connectionLimit: 10,

  // queueLimit: cuantas queries pueden esperar conexion libre.
  // 0 = ilimitado (mejor para que no se pierdan requests).
  queueLimit: 0,

  // --- Configuracion de queries ---
  // Convertir DATE/DATETIME a objetos Date de JS automaticamente.
  dateStrings: false,

  // Soporte para BIGINT (lo usamos por las dudas con conteos).
  supportBigNumbers: true,
  bigNumberStrings: false,

  // Forzar utf8mb4 en cada conexion del pool.
  charset: 'utf8mb4',

  // Zona horaria: pedimos a MySQL que devuelva los TIMESTAMP
  // ya convertidos a Argentina (-03:00). El servidor MySQL ya
  // tiene esta config por flags, pero la repetimos del lado del
  // cliente por las dudas.
  timezone: '-03:00',
});


// -------------------------------------------------------------
//   Probar conexion al arranque
// -------------------------------------------------------------
// Util para que el servidor falle rapido si MySQL no esta
// disponible, en lugar de devolver errores 500 a cada request.
// -------------------------------------------------------------
export async function probarConexion() {
  let conexion;
  try {
    conexion = await pool.getConnection();
    await conexion.ping();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
      codigo: error.code,
    };
  } finally {
    if (conexion) conexion.release();
  }
}


// -------------------------------------------------------------
//   Cerrar pool
// -------------------------------------------------------------
// Se llama desde el shutdown del servidor para liberar las
// conexiones correctamente. Sin esto, Node tarda en cerrar.
// -------------------------------------------------------------
export async function cerrarPool() {
  await pool.end();
}
