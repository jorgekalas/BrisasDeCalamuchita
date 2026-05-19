// =============================================================
//   MODELO — PROPIEDAD
// =============================================================
//   Queries SQL relacionadas a la tabla `propiedad`.
//   Por ahora solo hay una fila (id=1), pero el modelo esta
//   pensado para soportar multiples propiedades en el futuro.
// =============================================================

import { pool } from '../config/bd.js';


// -------------------------------------------------------------
//   Buscar por ID
// -------------------------------------------------------------
export async function buscarPorId(id) {
  const [filas] = await pool.query(
    `SELECT id, nombre, ubicacion, direccion, latitud, longitud,
            descripcion, precio_por_noche, capacidad_minima, capacidad_maxima,
            activa, creado_en, actualizado_en
       FROM propiedad
      WHERE id = ?
      LIMIT 1`,
    [id]
  );
  return filas[0] || null;
}


// -------------------------------------------------------------
//   Listar todas las propiedades activas
// -------------------------------------------------------------
//   Por ahora siempre devuelve 1 fila. En el futuro permite
//   tener multiples propiedades activas o pausadas.
// -------------------------------------------------------------
export async function listarActivas() {
  const [filas] = await pool.query(
    `SELECT id, nombre, ubicacion, direccion, latitud, longitud,
            descripcion, precio_por_noche, capacidad_minima, capacidad_maxima
       FROM propiedad
      WHERE activa = TRUE
      ORDER BY id`
  );
  return filas;
}


// -------------------------------------------------------------
//   Actualizar campos editables de la propiedad
// -------------------------------------------------------------
//   Solo permite editar campos "del negocio" (precio, descripcion,
//   capacidad). No permite cambiar ubicacion o coordenadas desde
//   el admin (eso seria un cambio mayor que requeriria un endpoint
//   especial).
// -------------------------------------------------------------
export async function actualizar(id, cambios) {
  // Construimos el UPDATE dinamicamente segun que campos vinieron
  const camposPermitidos = [
    'nombre', 'descripcion', 'precio_por_noche',
    'capacidad_minima', 'capacidad_maxima', 'activa',
  ];

  const setPartes = [];
  const valores = [];

  for (const campo of camposPermitidos) {
    if (cambios[campo] !== undefined) {
      setPartes.push(`${campo} = ?`);
      valores.push(cambios[campo]);
    }
  }

  if (setPartes.length === 0) {
    // No vino ningun campo valido para actualizar.
    // Devolvemos el estado actual sin tocar nada.
    return await buscarPorId(id);
  }

  valores.push(id);

  await pool.query(
    `UPDATE propiedad SET ${setPartes.join(', ')} WHERE id = ?`,
    valores
  );

  return await buscarPorId(id);
}
