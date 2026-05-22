// =============================================================
//   TESTS — Componente RutaProtegida
// =============================================================

import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RutaProtegida from '../RutaProtegida.jsx';
import { ProveedorAuth } from '../../contexto/ContextoAuth.jsx';
import { STORAGE_TOKEN_KEY, STORAGE_USUARIO_KEY } from '../../api/cliente.js';


function renderConRouter(ui, { ruta = '/protegida' } = {}) {
  return render(
    <ProveedorAuth>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path="/ingresar" element={<div>Pantalla Login</div>} />
          <Route path="/protegida" element={ui} />
        </Routes>
      </MemoryRouter>
    </ProveedorAuth>
  );
}


describe('RutaProtegida', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  test('sin usuario: redirige a /ingresar', async () => {
    renderConRouter(
      <RutaProtegida>
        <div>Contenido secreto</div>
      </RutaProtegida>
    );

    await waitFor(() => {
      expect(screen.getByText('Pantalla Login')).toBeInTheDocument();
    });
    expect(screen.queryByText('Contenido secreto')).not.toBeInTheDocument();
  });

  test('con usuario cliente: muestra el contenido', async () => {
    localStorage.setItem(STORAGE_TOKEN_KEY, 'token-maria-de-prueba');
    localStorage.setItem(STORAGE_USUARIO_KEY, JSON.stringify({
      id: 2, email: 'maria@ejemplo.com', nombre: 'María', tipo: 'cliente',
    }));

    renderConRouter(
      <RutaProtegida>
        <div>Contenido secreto</div>
      </RutaProtegida>
    );

    await waitFor(() => {
      expect(screen.getByText('Contenido secreto')).toBeInTheDocument();
    });
  });

  test('rol incorrecto: muestra Acceso denegado', async () => {
    localStorage.setItem(STORAGE_TOKEN_KEY, 'token-maria-de-prueba');
    localStorage.setItem(STORAGE_USUARIO_KEY, JSON.stringify({
      id: 2, email: 'maria@ejemplo.com', nombre: 'María', tipo: 'cliente',
    }));

    renderConRouter(
      <RutaProtegida rol="administrador">
        <div>Solo admin</div>
      </RutaProtegida>
    );

    await waitFor(() => {
      expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    });
    expect(screen.queryByText('Solo admin')).not.toBeInTheDocument();
  });

  test('rol correcto: muestra el contenido', async () => {
    localStorage.setItem(STORAGE_TOKEN_KEY, 'token-admin-de-prueba');
    localStorage.setItem(STORAGE_USUARIO_KEY, JSON.stringify({
      id: 1, email: 'admin@brisas.com.ar', nombre: 'Jorge', tipo: 'administrador',
    }));

    renderConRouter(
      <RutaProtegida rol="administrador">
        <div>Panel admin</div>
      </RutaProtegida>
    );

    await waitFor(() => {
      expect(screen.getByText('Panel admin')).toBeInTheDocument();
    });
  });
});
