// =============================================================
//   HELPER — Gestion de BD de pruebas
// =============================================================
//   Funciones para preparar la BD de pruebas (brisas_test).
//
//   Estrategia (V2 - mas robusta):
//   - resetearBD(): NO dropea la BD entera (requiere permisos de root).
//     En su lugar, droppea todas las tablas dentro de brisas_test,
//     vuelve a crearlas con la migracion, y carga las seeds.
//   - Maneja errores explicitamente con mensajes claros.
//   - La BD brisas_test debe existir antes (se crea con un script de
//     setup que el usuario corre una sola vez).
// =============================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARPETA_BACKEND = path.resolve(__dirname, '../..');
const RUTA_MIGRACION = path.join(CARPETA_BACKEND, 'migraciones/001_schema.sql');
const RUTA_SEMILLAS  = path.join(CARPETA_BACKEND, 'semillas/001_datos_iniciales.sql');


// -------------------------------------------------------------
//   Crear conexion directa a brisas_test
// -------------------------------------------------------------
async function conexionABD() {
  const config = {
    host: process.env.BD_HOST || '127.0.0.1',
    port: Number(process.env.BD_PUERTO) || 3307,
    user: process.env.BD_USUARIO || 'brisas_user',
    password: process.env.BD_PASSWORD || 'brisas_password_local',
    database: process.env.BD_NOMBRE || 'brisas_test',
    multipleStatements: true,
  };

  try {
    return await mysql.createConnection(config);
  } catch (err) {
    throw new Error(
      `No pude conectar a MySQL para los tests E2E.\n` +
      `   Config: ${config.user}@${config.host}:${config.port}/${config.database}\n` +
      `   Error: ${err.message}\n\n` +
      `   Verifica que:\n` +
      `   1. Docker este corriendo (docker compose ps debe mostrar MySQL Up).\n` +
      `   2. La BD '${config.database}' exista.\n` +
      `   3. El usuario '${config.user}' tenga GRANT sobre '${config.database}'.\n`
    );
  }
}


// -------------------------------------------------------------
//   Borrar todas las tablas de la BD de pruebas
// -------------------------------------------------------------
async function borrarTablas(conexion) {
  const [filas] = await conexion.query('SHOW TABLES');
  if (filas.length === 0) return;

  await conexion.query('SET FOREIGN_KEY_CHECKS = 0');

  for (const fila of filas) {
    const nombreTabla = Object.values(fila)[0];
    await conexion.query(`DROP TABLE IF EXISTS \`${nombreTabla}\``);
  }

  await conexion.query('SET FOREIGN_KEY_CHECKS = 1');
}


// -------------------------------------------------------------
//   Ejecutar un archivo SQL completo
// -------------------------------------------------------------
//   El archivo de migracion tiene DROP DATABASE / CREATE DATABASE /
//   USE DATABASE al principio (para uso en desarrollo). En tests
//   eso no aplica porque ya estamos conectados a brisas_test:
//   esas sentencias se filtran antes de ejecutar.
// -------------------------------------------------------------
async function ejecutarArchivoSQL(conexion, ruta, etiqueta) {
  if (!fs.existsSync(ruta)) {
    throw new Error(`No existe el archivo SQL para ${etiqueta}: ${ruta}`);
  }

  let sql = fs.readFileSync(ruta, 'utf-8');

  // Filtramos las sentencias que no aplican en el contexto de tests
  // (esas hacen referencia a brisas_de_calamuchita y solo las puede
  // ejecutar root). En tests, la conexion ya esta apuntando a brisas_test.
  sql = sql
    .replace(/DROP\s+DATABASE\s+IF\s+EXISTS\s+brisas_de_calamuchita\s*;/gi, '')
    .replace(/CREATE\s+DATABASE\s+brisas_de_calamuchita[^;]*;/gi, '')
    .replace(/USE\s+brisas_de_calamuchita\s*;/gi, '');

  try {
    await conexion.query(sql);
  } catch (err) {
    throw new Error(
      `Error ejecutando ${etiqueta} (${path.basename(ruta)}):\n` +
      `   ${err.message}`
    );
  }
}


// -------------------------------------------------------------
//   Resetear BD: drop tablas + migrar + semillas
// -------------------------------------------------------------
export async function resetearBD() {
  const conexion = await conexionABD();
  try {
    await borrarTablas(conexion);
    await ejecutarArchivoSQL(conexion, RUTA_MIGRACION, 'migracion');
    await ejecutarArchivoSQL(conexion, RUTA_SEMILLAS, 'semillas');
  } finally {
    await conexion.end();
  }
}


// -------------------------------------------------------------
//   Limpiar BD: borra solo lo creado por el test
// -------------------------------------------------------------
export async function limpiarReservasNuevas() {
  const conexion = await conexionABD();
  try {
    await conexion.query(`DELETE FROM reserva WHERE id > 30`);
    await conexion.query(`DELETE FROM notificacion`);
    await conexion.query(`ALTER TABLE reserva AUTO_INCREMENT = 31`);
    await conexion.query(`ALTER TABLE notificacion AUTO_INCREMENT = 1`);
  } finally {
    await conexion.end();
  }
}


// -------------------------------------------------------------
//   Cerrar pool de la app despues de los tests
// -------------------------------------------------------------
export async function cerrarPoolApp() {
  const { cerrarPool } = await import('../../src/config/bd.js');
  await cerrarPool();
}
