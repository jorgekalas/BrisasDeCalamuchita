// =============================================================
//   CONTEXTO — AUTENTICACION
// =============================================================
//   Provee el usuario logueado y las funciones para login/logout.
//   Persiste en localStorage:
//     - brisas:token   → JWT
//     - brisas:usuario → objeto con datos del usuario
//
//   Al montarse, rehidrata desde localStorage para mantener la
//   sesion entre recargas.
// =============================================================

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  STORAGE_TOKEN_KEY,
  STORAGE_USUARIO_KEY,
} from '../api/cliente.js';
import * as apiAuth from '../api/auth.js';


// -------------------------------------------------------------
//   Contexto
// -------------------------------------------------------------
const ContextoAuth = createContext(null);


// -------------------------------------------------------------
//   Helper: leer usuario de localStorage al arrancar
// -------------------------------------------------------------
function leerUsuarioGuardado() {
  try {
    const raw = localStorage.getItem(STORAGE_USUARIO_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    // localStorage corrupto, lo limpiamos
    localStorage.removeItem(STORAGE_USUARIO_KEY);
    return null;
  }
}


// -------------------------------------------------------------
//   Proveedor
// -------------------------------------------------------------
export function ProveedorAuth({ children }) {
  // Estado: usuario logueado (o null)
  const [usuario, setUsuario] = useState(() => leerUsuarioGuardado());

  // Flag de "estamos cargando datos al arrancar" para evitar
  // parpadeos en el UI.
  const [cargando, setCargando] = useState(true);


  // -----------------------------------------------------------
  //   Rehidratacion al montar
  // -----------------------------------------------------------
  //   Si hay token guardado, verificamos contra el backend con
  //   /api/auth/yo. Si el backend dice que el token sigue siendo
  //   valido, refrescamos los datos del usuario. Si no, limpiamos.
  // -----------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!token) {
      setCargando(false);
      return;
    }

    let cancelado = false;
    apiAuth.obtenerYo()
      .then((u) => {
        if (cancelado) return;
        setUsuario(u);
        localStorage.setItem(STORAGE_USUARIO_KEY, JSON.stringify(u));
      })
      .catch(() => {
        // El token venció o es invalido. El interceptor de cliente.js
        // ya hizo cleanup y redirect, pero por las dudas:
        if (!cancelado) {
          setUsuario(null);
          localStorage.removeItem(STORAGE_TOKEN_KEY);
          localStorage.removeItem(STORAGE_USUARIO_KEY);
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => { cancelado = true; };
  }, []);


  // -----------------------------------------------------------
  //   iniciarSesion(email, password) → Promise<usuario>
  // -----------------------------------------------------------
  const iniciarSesion = useCallback(async (email, password) => {
    const { usuario: u, token } = await apiAuth.login({ email, password });
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_USUARIO_KEY, JSON.stringify(u));
    setUsuario(u);
    return u;
  }, []);


  // -----------------------------------------------------------
  //   registrar(datos) → Promise<usuario>
  // -----------------------------------------------------------
  const registrar = useCallback(async (datos) => {
    const { usuario: u, token } = await apiAuth.registrar(datos);
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_USUARIO_KEY, JSON.stringify(u));
    setUsuario(u);
    return u;
  }, []);


  // -----------------------------------------------------------
  //   cerrarSesion()
  // -----------------------------------------------------------
  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USUARIO_KEY);
    setUsuario(null);
  }, []);


  // -----------------------------------------------------------
  //   Derived: helpers de rol
  // -----------------------------------------------------------
  const estaAutenticado = !!usuario;
  const esAdmin = usuario?.tipo === 'administrador';
  const esCliente = usuario?.tipo === 'cliente';


  const valor = {
    usuario,
    cargando,
    estaAutenticado,
    esAdmin,
    esCliente,
    iniciarSesion,
    registrar,
    cerrarSesion,
  };

  return (
    <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>
  );
}


// -------------------------------------------------------------
//   Hook para consumir el contexto
// -------------------------------------------------------------
export function useAuth() {
  const ctx = useContext(ContextoAuth);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <ProveedorAuth>');
  }
  return ctx;
}
