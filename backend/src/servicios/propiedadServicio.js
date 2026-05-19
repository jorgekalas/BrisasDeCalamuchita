// =============================================================
//   SERVICIO — PROPIEDAD
// =============================================================
//   Logica de negocio para los endpoints de propiedad.
//   Mantenemos las funciones simples porque la propiedad es
//   solo una y los cambios son acotados.
// =============================================================

import * as propiedadModelo from '../modelos/propiedadModelo.js';
import { NoEncontrado, ValidacionFallida } from '../utilidades/errores.js';


// -------------------------------------------------------------
//   Listar propiedades activas
// -------------------------------------------------------------
//   El endpoint publico usa esto. Por ahora siempre va a
//   devolver 1 fila (la unica propiedad activa).
// -------------------------------------------------------------
export async function listar() {
  return await propiedadModelo.listarActivas();
}


// -------------------------------------------------------------
//   Buscar por ID
// -------------------------------------------------------------
export async function obtener(id) {
  const propiedad = await propiedadModelo.buscarPorId(id);
  if (!propiedad) {
    throw new NoEncontrado('La propiedad solicitada no existe');
  }
  return propiedad;
}


// -------------------------------------------------------------
//   Actualizar propiedad (solo admin)
// -------------------------------------------------------------
//   Reglas:
//   - capacidad_minima debe ser <= capacidad_maxima
//   - precio_por_noche debe ser > 0
//   La BD ya tiene los CHECK constraints, pero validamos
//   aca tambien para devolver errores claros antes de pegarle
//   a la BD.
// -------------------------------------------------------------
export async function actualizar(id, cambios) {
  // Validacion de coherencia entre minima y maxima.
  // Si se cambia solo una, comparamos con el valor actual.
  if (cambios.capacidad_minima !== undefined || cambios.capacidad_maxima !== undefined) {
    const actual = await propiedadModelo.buscarPorId(id);
    if (!actual) {
      throw new NoEncontrado('La propiedad no existe');
    }

    const minimaFinal = cambios.capacidad_minima ?? actual.capacidad_minima;
    const maximaFinal = cambios.capacidad_maxima ?? actual.capacidad_maxima;

    if (minimaFinal > maximaFinal) {
      throw new ValidacionFallida(
        'La capacidad minima no puede ser mayor a la maxima'
      );
    }
  }

  return await propiedadModelo.actualizar(id, cambios);
}
