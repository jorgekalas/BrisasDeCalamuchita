// =============================================================
//   SERVIDOR — BOOTSTRAP HTTP
// =============================================================
//   Punto de entrada de la aplicacion. Hace tres cosas:
//     1. Prueba la conexion a la BD al arrancar (fail-fast).
//     2. Levanta el servidor HTTP escuchando en el puerto.
//     3. Maneja senales del SO para hacer graceful shutdown.
//
//   El graceful shutdown es importante: cuando paramos el
//   servidor (Ctrl+C, deploy, etc.), terminamos las queries
//   en curso y cerramos las conexiones del pool ordenadamente.
//   Sin esto, Node tarda en cerrar y puede dejar transacciones
//   colgadas.
// =============================================================

import { app } from './app.js';
import { env, esPruebas } from './config/env.js';
import { probarConexion, cerrarPool } from './config/bd.js';
import {
  iniciarCronCancelarBloqueosVencidos,
  detenerCronCancelarBloqueosVencidos,
} from './tareas/cancelarBloqueosVencidos.js';


// -------------------------------------------------------------
//   Banner de arranque
// -------------------------------------------------------------
const banner = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          BRISAS DE CALAMUCHITA — API REST                    ║
║          Version: 0.1.0                                      ║
║          Entorno: ${env.NODE_ENV.padEnd(43)}║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;
console.log(banner);


// -------------------------------------------------------------
//   1. Probar conexion a la BD
// -------------------------------------------------------------
console.log('🔌 Probando conexion a MySQL...');
const conexion = await probarConexion();

if (!conexion.ok) {
  console.error(`❌ No se pudo conectar a MySQL: ${conexion.error}`);
  console.error('   Verifica que el contenedor este corriendo:');
  console.error('   $ docker compose ps');
  console.error('   Y que las variables de tu .env coincidan con docker-compose.yml\n');
  process.exit(1);
}
console.log(`✅ Conectado a MySQL en ${env.BD_HOST}:${env.BD_PUERTO}/${env.BD_NOMBRE}\n`);


// -------------------------------------------------------------
//   2. Levantar el servidor HTTP
// -------------------------------------------------------------
const servidor = app.listen(env.PUERTO, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${env.PUERTO}`);
  console.log(`   • Healthcheck:   http://localhost:${env.PUERTO}/api/salud`);
  console.log(`   • CORS abierto:  ${env.URL_FRONTEND}\n`);
});


// -------------------------------------------------------------
//   2.b Arrancar las tareas en segundo plano
// -------------------------------------------------------------
//   En entorno de pruebas no las arrancamos: ensucia los tests
//   con cancelaciones automaticas y queda corriendo el timer.
// -------------------------------------------------------------
if (!esPruebas) {
  iniciarCronCancelarBloqueosVencidos();
}


// -------------------------------------------------------------
//   3. Graceful shutdown
// -------------------------------------------------------------
// Cuando recibimos SIGTERM (deploy/contenedor) o SIGINT (Ctrl+C),
// hacemos lo siguiente:
//   1. Dejamos de aceptar requests nuevas.
//   2. Esperamos que terminen las que estan en vuelo (max 10s).
//   3. Cerramos el pool de MySQL.
//   4. Salimos limpiamente.
// -------------------------------------------------------------
async function shutdown(senial) {
  console.log(`\n⏸  Recibida señal ${senial}, cerrando servidor...`);

  // Timeout de seguridad: si no termina en 10s, forzamos la salida.
  const timeoutForzado = setTimeout(() => {
    console.error('⚠️  Shutdown forzado: timeout de 10s alcanzado.');
    process.exit(1);
  }, 10_000);

  try {
    // 1. Detener tareas en segundo plano
    detenerCronCancelarBloqueosVencidos();
    console.log('   ✓ Tareas en segundo plano detenidas');

    // 2. Cerrar el servidor HTTP (deja de aceptar nuevas requests).
    await new Promise((resolve, reject) => {
      servidor.close(err => (err ? reject(err) : resolve()));
    });
    console.log('   ✓ Servidor HTTP cerrado');

    // 3. Cerrar el pool de MySQL.
    await cerrarPool();
    console.log('   ✓ Pool de MySQL cerrado');

    clearTimeout(timeoutForzado);
    console.log('👋 Adios.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante shutdown:', err);
    clearTimeout(timeoutForzado);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));


// -------------------------------------------------------------
//   Manejo de errores no capturados (ultima linea de defensa)
// -------------------------------------------------------------
// Si una excepcion llega hasta aca es porque NO la atrapo el
// manejador centralizado. Loggeamos con detalle y salimos:
// es mejor reiniciar el proceso limpio que seguir con un estado
// posiblemente corrupto.
// -------------------------------------------------------------
process.on('unhandledRejection', (razon, promesa) => {
  console.error('❌ Promesa no manejada:', promesa);
  console.error('   Razon:', razon);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('❌ Excepcion no capturada:', err);
  shutdown('uncaughtException');
});
