// =============================================================
//   CONFIGURACION DE JEST
// =============================================================
//   Backend Brisas de Calamuchita.
//
//   Notas:
//   - Jest no soporta ESM nativo, asi que se ejecuta con
//     `node --experimental-vm-modules` (ver scripts en package.json).
//   - testEnvironment 'node' porque no testeamos UI.
//   - Threshold de cobertura 70% global (defendible para academico).
//   - Los tests de e2e necesitan --runInBand (1 worker) porque
//     comparten la misma BD MySQL.
// =============================================================

export default {
  testEnvironment: 'node',

  // Patrones de archivos de test
  testMatch: ['**/tests/**/*.test.js'],

  // Timeout: los tests e2e que arrancan la BD pueden tardar mas
  testTimeout: 15000,

  // Cobertura
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/servidor.js',           // bootstrap, no se testea
    '!src/config/env.js',         // solo carga variables
  ],
  coverageThreshold: {
    global: {
      branches: 60,    // ramas de if/else
      functions: 70,   // funciones llamadas
      lines: 70,       // lineas ejecutadas
      statements: 70,
    },
  },
  coverageReporters: ['text', 'html', 'lcov'],
  coverageDirectory: 'cobertura',

  // Variables de entorno para los tests
  setupFiles: ['<rootDir>/tests/helpers/setup-env.js'],

  // Setup que corre antes de cada archivo de test
  // (no de cada test individual, eso seria beforeEach)
  // setupFilesAfterEach: ['<rootDir>/tests/helpers/setup-tests.js'],

  // Reporte de tests claro
  verbose: false,
  errorOnDeprecated: true,

  // Mostrar tests lentos
  slowTestThreshold: 5,
};
