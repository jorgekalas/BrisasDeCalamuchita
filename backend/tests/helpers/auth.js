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
    // Diagnostico para CI: que usuarios hay en la BD justo ahora?
    try {
      const { default: pool } = await import('../../src/config/bd.js');
      const [usuarios] = await pool.query(
        'SELECT id, email, tipo, activo FROM usuario ORDER BY id'
      );
      console.error('\n=== DIAGNOSTICO LOGIN FALLIDO ===');
      console.error(`Intentando login con: ${email} / ${password}`);
      console.error(`Status devuelto: ${res.status}`);
      console.error(`Body: ${JSON.stringify(res.body)}`);
      console.error(`Usuarios en BD (${usuarios.length}):`);
      console.table(usuarios);
      console.error('=================================\n');
    } catch (e) {
      console.error('No pude listar usuarios:', e.message);
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
