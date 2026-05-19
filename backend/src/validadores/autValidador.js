// =============================================================
//   VALIDADORES — AUTENTICACION
// =============================================================
//   Schemas Zod que validan los datos de entrada de los
//   endpoints de auth. Si los datos no cumplen el schema,
//   Zod tira un error que el manejador centralizado convierte
//   en respuesta 400 con detalle por campo.
// =============================================================

import { z } from 'zod';


// -------------------------------------------------------------
//   Schema: registro de cliente
// -------------------------------------------------------------
//   Campos obligatorios: email, password, nombre, apellido.
//   Opcionales: telefono, dni, fecha_nacimiento.
// -------------------------------------------------------------
export const schemaRegistro = z.object({
  email: z
    .string({ required_error: 'El email es obligatorio' })
    .trim()
    .toLowerCase()
    .email('El email no tiene un formato valido')
    .max(150, 'El email es demasiado largo'),

  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña es demasiado larga'),
    // bcrypt limita a 72 bytes, lo aclaramos en el schema

  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(80, 'El nombre es demasiado largo'),

  apellido: z
    .string({ required_error: 'El apellido es obligatorio' })
    .trim()
    .min(1, 'El apellido es obligatorio')
    .max(80, 'El apellido es demasiado largo'),

  telefono: z
    .string()
    .trim()
    .max(30, 'El teléfono es demasiado largo')
    .optional()
    .or(z.literal('')),

  dni: z
    .string()
    .trim()
    .max(20, 'El DNI es demasiado largo')
    .optional()
    .or(z.literal('')),

  fecha_nacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe estar en formato YYYY-MM-DD')
    .optional()
    .or(z.literal('')),
});


// -------------------------------------------------------------
//   Schema: login
// -------------------------------------------------------------
export const schemaLogin = z.object({
  email: z
    .string({ required_error: 'El email es obligatorio' })
    .trim()
    .toLowerCase()
    .email('El email no tiene un formato valido'),

  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña es obligatoria'),
    // En login no aplicamos min(8): si el usuario tipea 3 caracteres
    // que se rechace por credenciales invalidas, no por validacion.
});
