// =============================================================
//   HOOK — useApi(fn, dependencias?)
// =============================================================
//   Helper para componentes que necesitan llamar a una funcion
//   async (tipicamente de la capa api/) y mostrar loading/error/data.
//
//   Uso:
//     const { datos, cargando, error, recargar } =
//       useApi(() => apiPropiedad.listarPropiedades());
//
//   Re-ejecuta la funcion cuando cambian las dependencias.
// =============================================================

import { useState, useEffect, useCallback } from 'react';
import { extraerError } from '../api/cliente.js';


export function useApi(fn, dependencias = []) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const ejecutar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fn();
      setDatos(resultado);
    } catch (err) {
      setError(extraerError(err));
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);

  useEffect(() => {
    ejecutar();
  }, [ejecutar]);

  return { datos, cargando, error, recargar: ejecutar };
}
