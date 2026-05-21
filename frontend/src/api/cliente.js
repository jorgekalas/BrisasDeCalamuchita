// =============================================================
//   API — CLIENTE HTTP CENTRALIZADO
// =============================================================
//   Instancia única de axios que usan todos los modulos de la
//   carpeta `api/`. Incluye:
//
//     - baseURL configurable via VITE_API_URL (default: /api proxeado por Vite)
//     - interceptor de REQUEST: agrega el token JWT si esta en localStorage
//     - interceptor de RESPONSE: si viene 401, dispara logout + redirect
//     - extractor de errores: convierte cualquier error en un objeto uniforme
// =============================================================

import axios from 'axios';

// Claves en localStorage para guardar usuario + token.
// Las exporto para que otros modulos puedan leerlas/limpiarlas.
export const STORAGE_TOKEN_KEY   = 'brisas:token';
export const STORAGE_USUARIO_KEY = 'brisas:usuario';


// -------------------------------------------------------------
//   Base URL
// -------------------------------------------------------------
//   En desarrollo, las requests van a `/api/...` y Vite las
//   redirige al backend (configurado en vite.config.js).
//
//   En produccion (build), VITE_API_URL debe apuntar al backend
//   desplegado, por ejemplo: https://brisas-backend.railway.app
// -------------------------------------------------------------
const baseURL = import.meta.env.VITE_API_URL || '';


// -------------------------------------------------------------
//   Instancia de axios
// -------------------------------------------------------------
export const cliente = axios.create({
  baseURL,
  timeout: 15_000,            // 15s antes de declarar timeout
  headers: {
    'Content-Type': 'application/json',
  },
});


// -------------------------------------------------------------
//   Interceptor de REQUEST: agregar token JWT
// -------------------------------------------------------------
cliente.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// -------------------------------------------------------------
//   Interceptor de RESPONSE: manejar 401 globalmente
// -------------------------------------------------------------
//   Cuando el backend devuelve 401, significa que el token
//   vencio o es invalido. Limpiamos el localStorage y mandamos
//   al usuario a /ingresar con un query param que la pagina
//   de login lee para mostrar un mensaje.
//
//   Excepcion: NO redirigimos si la request era el propio login
//   (sino el usuario intenta loguearse mal y lo sacamos de la
//   pagina antes de que vea el error).
// -------------------------------------------------------------
cliente.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const urlOriginal = error?.config?.url || '';

    // No redirigir si el 401 viene del propio login o registro
    const esLoginORegistro =
      urlOriginal.includes('/api/auth/login') ||
      urlOriginal.includes('/api/auth/registro');

    if (status === 401 && !esLoginORegistro) {
      // Limpieza
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USUARIO_KEY);

      // Redirect con query param para mostrar el mensaje
      if (typeof window !== 'undefined' && window.location.pathname !== '/ingresar') {
        window.location.href = '/ingresar?expiro=1';
      }
    }

    return Promise.reject(error);
  }
);


// -------------------------------------------------------------
//   Helper: extraer mensaje de error de la respuesta
// -------------------------------------------------------------
//   El backend devuelve errores con el formato:
//     { exito: false, error: { codigo, mensaje, detalles? } }
//
//   Esta funcion convierte cualquier excepcion de axios (timeout,
//   error de red, 4xx, 5xx) en un objeto uniforme para mostrar.
// -------------------------------------------------------------
export function extraerError(err) {
  // 1) Error de respuesta del backend con formato esperado
  if (err?.response?.data?.error) {
    const e = err.response.data.error;
    return {
      codigo: e.codigo || 'ERROR_DESCONOCIDO',
      mensaje: e.mensaje || 'Ocurrio un error',
      detalles: e.detalles || null,
      status: err.response.status,
    };
  }

  // 2) Error de respuesta pero el body no tiene el formato esperado
  if (err?.response) {
    return {
      codigo: 'ERROR_RESPUESTA',
      mensaje: `Error ${err.response.status} del servidor`,
      detalles: null,
      status: err.response.status,
    };
  }

  // 3) Timeout (no llego al server a tiempo)
  if (err?.code === 'ECONNABORTED') {
    return {
      codigo: 'TIMEOUT',
      mensaje: 'El servidor tardo demasiado en responder',
      detalles: null,
      status: null,
    };
  }

  // 4) Error de red (no se pudo conectar)
  if (err?.code === 'ERR_NETWORK' || !err?.response) {
    return {
      codigo: 'SIN_CONEXION',
      mensaje: 'No se pudo conectar al servidor',
      detalles: null,
      status: null,
    };
  }

  // 5) Cualquier otra cosa
  return {
    codigo: 'ERROR_DESCONOCIDO',
    mensaje: err?.message || 'Ocurrio un error inesperado',
    detalles: null,
    status: null,
  };
}
