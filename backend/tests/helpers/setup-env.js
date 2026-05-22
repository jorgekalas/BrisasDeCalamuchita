// =============================================================
//   SETUP — Variables de entorno para tests
// =============================================================
//   Se ejecuta ANTES de cargar los modulos del backend.
//   Setea las variables que Zod (src/config/env.js) necesita
//   y apunta a la BD de pruebas, no a la de desarrollo.
// =============================================================

process.env.NODE_ENV = 'pruebas';
process.env.PUERTO = '3000';                  // no se usa en tests, pero Zod no acepta 0
process.env.URL_FRONTEND = 'http://localhost:5173';

// BD: las E2E usan una BD separada brisas_test
// (la creamos en setup-bd.js antes de los tests)
process.env.BD_HOST = '127.0.0.1';
process.env.BD_PUERTO = '3307';
process.env.BD_USUARIO = 'brisas_user';
process.env.BD_PASSWORD = 'brisas_password_local';
process.env.BD_NOMBRE = 'brisas_test';

process.env.JWT_SECRETO = 'test-secret-suficientemente-largo-para-zod-32-caracteres-minimo';
process.env.JWT_EXPIRACION = '24h';

// Email en modo simulado (no manda nada de verdad)
process.env.EMAIL_MODO = 'simulado';
process.env.EMAIL_REMITENTE_NOMBRE = 'Brisas Test';
