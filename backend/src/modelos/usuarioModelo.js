// =============================================================
//   MODELO — USUARIO
// =============================================================
//   Capa de acceso a datos: todas las queries SQL relacionadas
//   a usuarios viven aca. Los servicios y controladores nunca
//   tocan SQL directamente.
//
//   Patron usado: funciones puras async que reciben el pool
//   (o conexion para transacciones) y devuelven datos.
// =============================================================

import { pool } from '../config/bd.js';


// -------------------------------------------------------------
//   Buscar usuario por email (incluye datos del rol)
// -------------------------------------------------------------
//   JOIN con cliente y administrador para traer los datos
//   especificos del rol en una sola query. Si no tiene rol
//   asignado, los campos vienen NULL.
//
//   Devuelve null si no existe.
// -------------------------------------------------------------
export async function buscarPorEmail(email) {
  const [filas] = await pool.query(
    `SELECT
       u.id,
       u.email,
       u.password_hash,
       u.nombre,
       u.apellido,
       u.telefono,
       u.tipo,
       u.activo,
       u.creado_en,
       c.dni,
       c.fecha_nacimiento,
       a.nivel_acceso
     FROM usuario u
     LEFT JOIN cliente c       ON c.usuario_id = u.id
     LEFT JOIN administrador a ON a.usuario_id = u.id
     WHERE u.email = ?
     LIMIT 1`,
    [email]
  );

  return filas[0] || null;
}


// -------------------------------------------------------------
//   Buscar usuario por ID
// -------------------------------------------------------------
//   Igual que buscarPorEmail pero por id. Se usa en el
//   middleware de auth para cargar el usuario desde el JWT.
// -------------------------------------------------------------
export async function buscarPorId(id) {
  const [filas] = await pool.query(
    `SELECT
       u.id,
       u.email,
       u.nombre,
       u.apellido,
       u.telefono,
       u.tipo,
       u.activo,
       u.creado_en,
       c.dni,
       c.fecha_nacimiento,
       a.nivel_acceso
     FROM usuario u
     LEFT JOIN cliente c       ON c.usuario_id = u.id
     LEFT JOIN administrador a ON a.usuario_id = u.id
     WHERE u.id = ?
     LIMIT 1`,
    [id]
  );

  return filas[0] || null;
}


// -------------------------------------------------------------
//   ¿Existe ese email en el sistema?
// -------------------------------------------------------------
//   Query optimizada (solo trae el id) para validar antes de
//   correr bcrypt en el registro.
// -------------------------------------------------------------
export async function existeEmail(email) {
  const [filas] = await pool.query(
    'SELECT id FROM usuario WHERE email = ? LIMIT 1',
    [email]
  );
  return filas.length > 0;
}


// -------------------------------------------------------------
//   Listar usuarios por tipo (clientes o administradores)
// -------------------------------------------------------------
//   Devuelve { usuarios, total } para paginar correctamente.
//   Por defecto trae solo activos. Si pasas activo=false trae
//   los desactivados.
// -------------------------------------------------------------
export async function listarPorTipo(tipo, { offset = 0, limite = 10, activo = true } = {}) {
  const filtroActivo = activo === false ? '' : 'AND u.activo = TRUE';

  const [filasConteo] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM usuario u
      WHERE u.tipo = ? ${filtroActivo}`,
    [tipo]
  );
  const total = filasConteo[0].total;

  const [filas] = await pool.query(
    `SELECT
       u.id,
       u.email,
       u.nombre,
       u.apellido,
       u.telefono,
       u.tipo,
       u.activo,
       u.creado_en,
       c.dni,
       c.fecha_nacimiento
     FROM usuario u
     LEFT JOIN cliente c ON c.usuario_id = u.id
     WHERE u.tipo = ? ${filtroActivo}
     ORDER BY u.apellido, u.nombre
     LIMIT ? OFFSET ?`,
    [tipo, limite, offset]
  );

  return { usuarios: filas, total };
}


// -------------------------------------------------------------
//   Actualizar perfil del usuario
// -------------------------------------------------------------
//   Solo permite editar los campos "del perfil": nombre,
//   apellido, telefono, dni, fecha_nacimiento. NO permite
//   cambiar email ni password (esos van por endpoints
//   separados con validaciones extra).
//
//   Usa transaccion porque actualiza usuario Y cliente (que
//   son tablas separadas por la herencia).
// -------------------------------------------------------------
export async function actualizarPerfil(usuarioId, cambios) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    // --- Tabla usuario: nombre, apellido, telefono ---
    const camposUsuario = ['nombre', 'apellido', 'telefono'];
    const setUsuario = [];
    const valoresUsuario = [];

    for (const campo of camposUsuario) {
      if (cambios[campo] !== undefined) {
        setUsuario.push(`${campo} = ?`);
        valoresUsuario.push(cambios[campo]);
      }
    }

    if (setUsuario.length > 0) {
      valoresUsuario.push(usuarioId);
      await conexion.query(
        `UPDATE usuario SET ${setUsuario.join(', ')} WHERE id = ?`,
        valoresUsuario
      );
    }

    // --- Tabla cliente: dni, fecha_nacimiento ---
    const camposCliente = ['dni', 'fecha_nacimiento'];
    const setCliente = [];
    const valoresCliente = [];

    for (const campo of camposCliente) {
      if (cambios[campo] !== undefined) {
        setCliente.push(`${campo} = ?`);
        valoresCliente.push(cambios[campo]);
      }
    }

    if (setCliente.length > 0) {
      valoresCliente.push(usuarioId);
      await conexion.query(
        `UPDATE cliente SET ${setCliente.join(', ')} WHERE usuario_id = ?`,
        valoresCliente
      );
    }

    await conexion.commit();

    // Devolver el usuario completo actualizado
    return await buscarPorId(usuarioId);
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

// -------------------------------------------------------------
//   Como tenemos herencia con tablas separadas, crear un
//   cliente implica DOS inserts: uno en `usuario` y otro en
//   `cliente`. Si el segundo falla, hay que deshacer el primero.
//   Por eso usamos una transaccion.
//
//   Recibe los datos ya validados (Zod corrio antes) y el
//   password ya hasheado (bcrypt corrio en el servicio).
// -------------------------------------------------------------
export async function crearCliente(datos) {
  const {
    email, password_hash, nombre, apellido, telefono,
    dni, fecha_nacimiento,
  } = datos;

  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();

    // 1. Insertar en usuario con tipo='cliente'
    const [resUsuario] = await conexion.query(
      `INSERT INTO usuario
         (email, password_hash, nombre, apellido, telefono, tipo)
       VALUES (?, ?, ?, ?, ?, 'cliente')`,
      [email, password_hash, nombre, apellido, telefono || null]
    );
    const usuarioId = resUsuario.insertId;

    // 2. Insertar en cliente (FK al usuario recien creado)
    await conexion.query(
      `INSERT INTO cliente (usuario_id, dni, fecha_nacimiento)
       VALUES (?, ?, ?)`,
      [usuarioId, dni || null, fecha_nacimiento || null]
    );

    await conexion.commit();

    // Devolver el usuario completo (sin el password_hash)
    return await buscarPorId(usuarioId);
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}
