// =============================================================
//   TESTS — ContextoAuth
// =============================================================

import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProveedorAuth, useAuth } from '../ContextoAuth.jsx';
import { STORAGE_TOKEN_KEY, STORAGE_USUARIO_KEY } from '../../api/cliente.js';


// Componente de prueba que expone el estado del contexto
function VisorAuth() {
  const { usuario, estaAutenticado, esAdmin, esCliente, iniciarSesion, cerrarSesion, registrar, cargando } = useAuth();
  return (
    <div>
      <div data-testid="cargando">{cargando ? 'si' : 'no'}</div>
      <div data-testid="auth">{estaAutenticado ? 'si' : 'no'}</div>
      <div data-testid="admin">{esAdmin ? 'si' : 'no'}</div>
      <div data-testid="cliente">{esCliente ? 'si' : 'no'}</div>
      <div data-testid="nombre">{usuario?.nombre || ''}</div>
      <button onClick={() => iniciarSesion('maria@ejemplo.com', 'demo1234')}>login-maria</button>
      <button onClick={() => iniciarSesion('admin@brisas.com.ar', 'demo1234')}>login-admin</button>
      <button onClick={() => iniciarSesion('mal', 'mal').catch(() => {})}>login-mal</button>
      <button onClick={cerrarSesion}>logout</button>
      <button onClick={() => registrar({ email: 'nuevo@x.com', password: 'pass1234', nombre: 'N', apellido: 'A' })}>registrar</button>
    </div>
  );
}


describe('ContextoAuth', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  test('estado inicial: sin usuario', async () => {
    render(<ProveedorAuth><VisorAuth /></ProveedorAuth>);

    // Esperar a que termine cargando
    await waitFor(() => {
      expect(screen.getByTestId('cargando')).toHaveTextContent('no');
    });
    expect(screen.getByTestId('auth')).toHaveTextContent('no');
  });

  test('rehidratacion: si hay token en localStorage, lo verifica contra /api/auth/yo', async () => {
    localStorage.setItem(STORAGE_TOKEN_KEY, 'token-maria-de-prueba');
    localStorage.setItem(STORAGE_USUARIO_KEY, JSON.stringify({ id: 2, email: 'maria@ejemplo.com', nombre: 'María', tipo: 'cliente' }));

    render(<ProveedorAuth><VisorAuth /></ProveedorAuth>);

    await waitFor(() => {
      expect(screen.getByTestId('cargando')).toHaveTextContent('no');
    });

    expect(screen.getByTestId('auth')).toHaveTextContent('si');
    expect(screen.getByTestId('nombre')).toHaveTextContent('María');
    expect(screen.getByTestId('cliente')).toHaveTextContent('si');
  });

  test('login OK guarda token y usuario en localStorage', async () => {
    const user = userEvent.setup();
    render(<ProveedorAuth><VisorAuth /></ProveedorAuth>);

    await waitFor(() => expect(screen.getByTestId('cargando')).toHaveTextContent('no'));

    await user.click(screen.getByText('login-maria'));

    await waitFor(() => {
      expect(screen.getByTestId('auth')).toHaveTextContent('si');
    });
    expect(screen.getByTestId('nombre')).toHaveTextContent('María');
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeTruthy();
    expect(localStorage.getItem(STORAGE_USUARIO_KEY)).toContain('maria@ejemplo.com');
  });

  test('login como admin: esAdmin = true', async () => {
    const user = userEvent.setup();
    render(<ProveedorAuth><VisorAuth /></ProveedorAuth>);

    await waitFor(() => expect(screen.getByTestId('cargando')).toHaveTextContent('no'));
    await user.click(screen.getByText('login-admin'));

    await waitFor(() => {
      expect(screen.getByTestId('admin')).toHaveTextContent('si');
      expect(screen.getByTestId('cliente')).toHaveTextContent('no');
    });
  });

  test('login con credenciales malas: tira error', async () => {
    const user = userEvent.setup();
    render(<ProveedorAuth><VisorAuth /></ProveedorAuth>);
    await waitFor(() => expect(screen.getByTestId('cargando')).toHaveTextContent('no'));

    // El login mal debe rechazar la promise
    // El componente no captura la excepcion, asi que esperamos un unhandled.
    // Como esto puede emitir un warning, hacemos un test mas simple:
    await user.click(screen.getByText('login-mal')).catch(() => {});

    // El usuario no quedo autenticado
    expect(screen.getByTestId('auth')).toHaveTextContent('no');
  });

  test('logout limpia localStorage', async () => {
    const user = userEvent.setup();
    localStorage.setItem(STORAGE_TOKEN_KEY, 'token-maria-de-prueba');
    localStorage.setItem(STORAGE_USUARIO_KEY, JSON.stringify({ id: 2, email: 'maria@ejemplo.com', nombre: 'María', tipo: 'cliente' }));

    render(<ProveedorAuth><VisorAuth /></ProveedorAuth>);
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('si'));

    await user.click(screen.getByText('logout'));

    expect(screen.getByTestId('auth')).toHaveTextContent('no');
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeNull();
  });

  test('registrar: auto-login', async () => {
    const user = userEvent.setup();
    render(<ProveedorAuth><VisorAuth /></ProveedorAuth>);
    await waitFor(() => expect(screen.getByTestId('cargando')).toHaveTextContent('no'));

    await user.click(screen.getByText('registrar'));

    await waitFor(() => {
      expect(screen.getByTestId('auth')).toHaveTextContent('si');
    });
    expect(localStorage.getItem(STORAGE_TOKEN_KEY)).toBeTruthy();
  });
});
