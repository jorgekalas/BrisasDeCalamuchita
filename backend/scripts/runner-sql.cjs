/**
 * =============================================================
 *   RUNNER DE MIGRACIONES Y SEMILLAS
 *   Brisas de Calamuchita
 * =============================================================
 *
 *   Ejecuta archivos .sql contra MySQL en orden alfabético.
 *
 *   Uso desde linea de comandos:
 *     node scripts/runner-sql.js migraciones
 *     node scripts/runner-sql.js semillas
 *     node scripts/runner-sql.js resetear
 *
 *   También se invoca desde los scripts npm:
 *     npm run migrar
 *     npm run semillas
 *     npm run resetear
 * =============================================================
 */

const fs = require('node:fs/promises');
const path = require('node:path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// -------------------------------------------------------------
//   Configuración desde .env
// -------------------------------------------------------------
const CONFIG_DB = {
  host: process.env.BD_HOST || 'localhost',
  port: Number(process.env.BD_PUERTO) || 3306,
  user: process.env.BD_USUARIO || 'root',
  password: process.env.BD_PASSWORD || '',
  // multipleStatements: true permite ejecutar varios statements en una sola query.
  // Es necesario para correr archivos .sql con muchos INSERT/CREATE seguidos.
  multipleStatements: true,
};

// Carpetas donde están los .sql, relativas a la raíz del backend.
const RUTAS = {
  migraciones: path.resolve(__dirname, '..', 'migraciones'),
  semillas:    path.resolve(__dirname, '..', 'semillas'),
};

// -------------------------------------------------------------
//   Utilidades de log con colores ANSI
// -------------------------------------------------------------
const colores = {
  reset:  '\x1b[0m',
  gris:   '\x1b[90m',
  verde:  '\x1b[32m',
  rojo:   '\x1b[31m',
  cyan:   '\x1b[36m',
  amarillo: '\x1b[33m',
  negrita: '\x1b[1m',
};

function log(msg, color = 'reset') {
  console.log(`${colores[color]}${msg}${colores.reset}`);
}

function logTitulo(msg) {
  log('');
  log(`━━━ ${msg} ━━━`, 'cyan');
}

// -------------------------------------------------------------
//   Lectura de archivos .sql en una carpeta
// -------------------------------------------------------------
async function listarArchivosSql(carpeta) {
  try {
    const archivos = await fs.readdir(carpeta);
    return archivos
      .filter(f => f.endsWith('.sql'))
      .sort(); // Orden alfabético = orden de ejecución
  } catch (error) {
    if (error.code === 'ENOENT') {
      log(`⚠ Carpeta no encontrada: ${carpeta}`, 'amarillo');
      return [];
    }
    throw error;
  }
}

// -------------------------------------------------------------
//   Ejecutar un archivo SQL contra la conexión
// -------------------------------------------------------------
async function ejecutarArchivo(conexion, rutaCompleta, nombreArchivo) {
  const inicio = Date.now();
  log(`  → Ejecutando ${nombreArchivo}...`, 'gris');

  const contenido = await fs.readFile(rutaCompleta, 'utf-8');

  // mysql2 con multipleStatements: true acepta el archivo entero en un query().
  // Si hay error, se rechaza la promesa con detalle del statement que falló.
  await conexion.query(contenido);

  const ms = Date.now() - inicio;
  log(`  ✓ ${nombreArchivo} (${ms}ms)`, 'verde');
}

// -------------------------------------------------------------
//   Comandos disponibles
// -------------------------------------------------------------
async function correrMigraciones(conexion) {
  logTitulo('MIGRACIONES');
  const archivos = await listarArchivosSql(RUTAS.migraciones);

  if (archivos.length === 0) {
    log('  No hay migraciones para ejecutar.', 'amarillo');
    return;
  }

  for (const archivo of archivos) {
    await ejecutarArchivo(conexion, path.join(RUTAS.migraciones, archivo), archivo);
  }

  log(`\n✓ ${archivos.length} migración(es) ejecutada(s) correctamente.`, 'verde');
}

async function correrSemillas(conexion) {
  logTitulo('SEMILLAS');
  const archivos = await listarArchivosSql(RUTAS.semillas);

  if (archivos.length === 0) {
    log('  No hay semillas para ejecutar.', 'amarillo');
    return;
  }

  for (const archivo of archivos) {
    await ejecutarArchivo(conexion, path.join(RUTAS.semillas, archivo), archivo);
  }

  log(`\n✓ ${archivos.length} semilla(s) ejecutada(s) correctamente.`, 'verde');
}

async function resetear(conexion) {
  log('\n⚠ Reseteando base de datos completa...', 'amarillo');
  log('  (Esto borra todos los datos. Solo usar en desarrollo.)', 'gris');
  await correrMigraciones(conexion);
  await correrSemillas(conexion);
  log('\n✓ Reset completo. Base de datos lista para usar.', 'verde');
}

// -------------------------------------------------------------
//   Main
// -------------------------------------------------------------
async function main() {
  const comando = process.argv[2];

  if (!comando) {
    log('\nUso:', 'negrita');
    log('  node scripts/runner-sql.js <comando>\n');
    log('Comandos disponibles:', 'negrita');
    log('  migrar     Ejecuta los archivos en migraciones/');
    log('  semillas   Ejecuta los archivos en semillas/');
    log('  resetear   Migraciones + semillas (reset completo)');
    log('');
    process.exit(1);
  }

  log('');
  log('━━━ Brisas de Calamuchita ━━━', 'cyan');
  log(`Conectando a MySQL en ${CONFIG_DB.host}:${CONFIG_DB.port}...`, 'gris');

  let conexion;
  try {
    conexion = await mysql.createConnection(CONFIG_DB);
    log(`✓ Conectado como '${CONFIG_DB.user}'\n`, 'verde');

    switch (comando) {
      case 'migrar':
        await correrMigraciones(conexion);
        break;
      case 'semillas':
        await correrSemillas(conexion);
        break;
      case 'resetear':
        await resetear(conexion);
        break;
      default:
        log(`\n✗ Comando desconocido: ${comando}`, 'rojo');
        log('  Usá: migrar, semillas o resetear', 'gris');
        process.exit(1);
    }

    log('');
  } catch (error) {
    log('\n✗ Error ejecutando el comando:', 'rojo');
    log(`  ${error.message}`, 'rojo');
    if (error.sqlMessage) {
      log(`  SQL: ${error.sqlMessage}`, 'gris');
    }
    if (error.code === 'ECONNREFUSED') {
      log('\n  Sugerencia: ¿está corriendo MySQL?', 'amarillo');
      log('  En desarrollo se levanta con: docker compose up -d', 'amarillo');
    }
    process.exit(1);
  } finally {
    if (conexion) {
      await conexion.end();
    }
  }
}

main();
