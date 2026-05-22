// =============================================================
//   SETUP GLOBAL DE TESTS — Vitest + RTL + MSW
// =============================================================

import '@testing-library/jest-dom/vitest';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mockHttp.js';


// Antes de toda la suite: arrancar MSW
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Despues de cada test: cleanup de DOM y resetear handlers de MSW
// (asi un test no afecta a otro)
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Al final: cerrar MSW
afterAll(() => {
  server.close();
});


// -------------------------------------------------------------
//   localStorage mock
// -------------------------------------------------------------
//   jsdom provee uno, pero a veces conviene resetearlo entre tests
//   para no contaminar. Lo dejo accesible globalmente.
// -------------------------------------------------------------
globalThis.limpiarStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
};


// -------------------------------------------------------------
//   window.matchMedia mock (algunos componentes lo usan)
// -------------------------------------------------------------
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});


// -------------------------------------------------------------
//   window.confirm mock (lo usa MisReservas y PanelAdmin)
// -------------------------------------------------------------
window.confirm = vi.fn(() => true);
