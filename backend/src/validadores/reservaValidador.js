// =============================================================
//   VALIDADOR — RESERVAS
// =============================================================
//   Schema Zod para el POST de crear reserva. Implementa las
//   validaciones sintacticas (formato, tipos, rangos). Las
//   reglas de negocio mas complejas (solapamiento, propiedad
//   activa, etc.) se validan en el servicio.
// =============================================================

import { z } from 'zod';


// -------------------------------------------------------------
//   Helper: hoy en formato YYYY-MM-DD
// -------------------------------------------------------------
function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}


// -------------------------------------------------------------
//   Sub-schema: vehiculo (opcional)
// -------------------------------------------------------------
//   El cliente puede no llevar vehiculo (RN-05 lo permite).
//   Si manda algo, debe tener patente y modelo.
// -------------------------------------------------------------
const schemaVehiculo = z.object({
  patente: z.string().trim().min(1, 'La patente es obligatoria').max(15),
  modelo:  z.string().trim().min(1, 'El modelo es obligatorio').max(100),
});


// -------------------------------------------------------------
//   Schema: crear reserva (POST /api/reservas)
// -------------------------------------------------------------
//   Reglas:
//     - fecha_ingreso debe ser hoy o futura (RN-10)
//     - fecha_egreso debe ser posterior a fecha_ingreso
//     - cantidad_huespedes entre 4 y 10 (RN-04)
//     - propiedad_id obligatorio (preparado para multi-propiedad)
//     - vehiculo opcional
//     - observaciones opcional, max 1000 chars
// -------------------------------------------------------------
export const schemaCrearReserva = z.object({
  propiedad_id: z.coerce.number().int().positive().default(1),

  fecha_ingreso: z
    .string({ required_error: 'La fecha de ingreso es obligatoria' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD')
    .refine(
      (f) => f >= hoyISO(),
      'La fecha de ingreso no puede ser pasada'
    ),

  fecha_egreso: z
    .string({ required_error: 'La fecha de egreso es obligatoria' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),

  cantidad_huespedes: z.coerce
    .number({ required_error: 'La cantidad de huespedes es obligatoria' })
    .int()
    .min(4, 'Minimo 4 huespedes')
    .max(10, 'Maximo 10 huespedes'),

  observaciones: z.string().trim().max(1000).optional().or(z.literal('')),

  vehiculo: schemaVehiculo.optional(),
}).refine(
  (data) => data.fecha_egreso > data.fecha_ingreso,
  {
    message: 'La fecha de egreso debe ser posterior a la de ingreso',
    path: ['fecha_egreso'],
  }
);


// -------------------------------------------------------------
//   Schema: cancelar reserva (motivo opcional)
// -------------------------------------------------------------
export const schemaCancelar = z.object({
  motivo: z.string().trim().max(500).optional().or(z.literal('')),
});
