// =============================================================
//   VALIDADORES — PROPIEDAD, RESERVA, USUARIO
// =============================================================
//   Schemas Zod para todos los inputs del Bloque 6.
//   Los reuno en un solo archivo porque cada uno tiene 1-2
//   schemas chicos. Si crecen los movemos a archivos separados.
// =============================================================

import { z } from 'zod';


// =============================================================
//   PROPIEDAD
// =============================================================

// Actualizar propiedad (PUT). Todos los campos son opcionales.
export const schemaActualizarPropiedad = z.object({
  nombre: z.string().trim().min(1).max(100).optional(),
  descripcion: z.string().trim().max(5000).optional(),
  precio_por_noche: z.coerce.number().positive('El precio debe ser mayor a 0').optional(),
  capacidad_minima: z.coerce.number().int().positive().optional(),
  capacidad_maxima: z.coerce.number().int().positive().optional(),
  activa: z.coerce.boolean().optional(),
});


// =============================================================
//   RESERVA
// =============================================================

// Estados validos para filtrar el listado del admin
const ESTADOS_RESERVA = [
  'Pendiente',
  'Confirmada',
  'En curso',
  'Finalizada',
  'Cancelada',
  'No Show',
];

// Query params para listar reservas
export const schemaListarReservas = z.object({
  estado: z.enum(ESTADOS_RESERVA).optional(),
});

// Query params para obtener disponibilidad
export const schemaDisponibilidad = z.object({
  desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'desde debe ser YYYY-MM-DD').optional(),
  hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'hasta debe ser YYYY-MM-DD').optional(),
}).refine(
  (data) => !data.desde || !data.hasta || data.desde <= data.hasta,
  { message: 'desde no puede ser posterior a hasta', path: ['desde'] }
);


// =============================================================
//   USUARIO
// =============================================================

// Actualizar perfil propio (PUT /api/usuarios/yo)
// Solo campos del perfil; email/password van por endpoints aparte.
export const schemaActualizarPerfil = z.object({
  nombre: z.string().trim().min(1, 'El nombre no puede estar vacio').max(80).optional(),
  apellido: z.string().trim().min(1, 'El apellido no puede estar vacio').max(80).optional(),
  telefono: z.string().trim().max(30).optional().or(z.literal('')),
  dni: z.string().trim().max(20).optional().or(z.literal('')),
  fecha_nacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe estar en formato YYYY-MM-DD')
    .optional()
    .or(z.literal('')),
});
