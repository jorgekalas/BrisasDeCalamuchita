// =============================================================
//   HELPER — Autenticacion en tests E2E
// =============================================================
//   Funciones de conveniencia para loguearse como admin o
//   como cliente y obtener tokens validos para las requests.
//
//   Las seeds incluyen:
//     - admin@brisas.com.ar / demo1234 (administrador)
//     - maria@ejemplo.com / demo1234 (cliente id=2)
//     - pedro@ejemplo.com / demo1234 (cliente id=3)
//     - etc.
// =============================================================

import request from 'supertest';


// -------------------------------------------------------------
//   Login y devuelve { usuario, token }
// -------------------------------------------------------------
export async function login(app, email, password = 'demo1234') {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  if (res.status !== 200) {
    // Diagnostico: conectarse directo a la BD y listar usuarios
    try {
      const mysql = (await import('mysql2/promise')).default;
      const conn = await mysql.createConnection({
        host: process.env.BD_HOST || '127.0.0.1',
        port: Number(process.env.BD_PUERTO) || 3307,
        user: process.env.BD_USUARIO || 'brisas_user',
        password: process.env.BD_PASSWORD || 'brisas_password_local',
        database: process.env.BD_NOMBRE || 'brisas_test',
      });
      const [usuarios] = await conn.query(
        'SELECT id, email, tipo, activo, LEFT(password_hash, 20) AS hash_prefix FROM usuario ORDER BY id'
      );
      console.error('\n=== DIAGNOSTICO LOGIN FALLIDO ===');
      console.error(`Intentando login con: ${email} / ${password}`);
      console.error(`Status: ${res.status}, Body: ${JSON.stringify(res.body)}`);
      console.error(`BD: ${process.env.BD_NOMBRE} @ ${process.env.BD_HOST}:${process.env.BD_PUERTO}`);
      console.error(`Usuarios en la tabla 'usuario' (total: ${usuarios.length}):`);
      console.error(JSON.stringify(usuarios, null, 2));
      console.error('=================================\n');
      await conn.end();
    } catch (e) {
      console.error('No pude listar usuarios:', e.message, e.stack);
    }
    throw new Error(`Login fallo (${res.status}): ${JSON.stringify(res.body)}`);
  }
  return res.body.datos;
}

// -------------------------------------------------------------
//   Loggear como admin (atajo)
// -------------------------------------------------------------
export async function loginAdmin(app) {
  return await login(app, 'admin@brisas.com.ar');
}


// -------------------------------------------------------------
//   Loggear como cliente Maria (atajo - id=2)
// -------------------------------------------------------------
export async function loginMaria(app) {
  return await login(app, 'maria@ejemplo.com');
}


// -------------------------------------------------------------
//   Loggear como cliente Miguel (atajo - id=3)
// -------------------------------------------------------------
//   Lo usamos como "segundo cliente" para tests donde necesitamos
//   verificar que un cliente no puede acceder a reservas de otro.
// -------------------------------------------------------------
export async function loginPedro(app) {
  return await login(app, 'mperez@ejemplo.com');
}
