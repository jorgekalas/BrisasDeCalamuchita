// =============================================================
//   CONFIGURACION DE VARIABLES DE ENTORNO
// =============================================================
//   Carga el .env y valida que esten todas las variables
//   requeridas con los tipos correctos. Si falta alguna o tiene
//   un valor invalido, el servidor falla al arrancar con un
//   error claro en lugar de fallar despues con un timeout
//   misterioso al primer query.
//
//   Uso desde el resto del codigo:
//     import { env } from './config/env.js';
//     console.log(env.BD_HOST);
// =============================================================

import { z } from 'zod';
import dotenv from 'dotenv';

// Carga las variables del .env al objeto process.env.
// Esto se hace una sola vez al importar este archivo.
dotenv.config();


// -------------------------------------------------------------
//   Schema de validacion
// -------------------------------------------------------------
// Define que variables son obligatorias, su tipo y valor por
// defecto si no estan definidas en el .env.
// -------------------------------------------------------------
const schemaEnv = z.object({
  // --- Servidor ---
  NODE_ENV: z
    .enum(['desarrollo', 'pruebas', 'produccion'])
    .default('desarrollo'),
  PUERTO: z.coerce.number().int().positive().default(3000),
  URL_FRONTEND: z.string().url().default('http://localhost:5173'),

  // --- Base de datos ---
  BD_HOST: z.string().min(1, 'BD_HOST es obligatorio'),
  BD_PUERTO: z.coerce.number().int().positive().default(3306),
  BD_USUARIO: z.string().min(1, 'BD_USUARIO es obligatorio'),
  BD_PASSWORD: z.string().min(1, 'BD_PASSWORD es obligatorio'),
  BD_NOMBRE: z.string().min(1, 'BD_NOMBRE es obligatorio'),

  // --- JWT (los usaremos en el Bloque 5) ---
  JWT_SECRETO: z.string().min(32, 'JWT_SECRETO debe tener al menos 32 caracteres').optional(),
  JWT_EXPIRACION: z.string().default('24h'),

  // --- Email (Bloque 8) ---
  EMAIL_HOST: z.string().optional(),
  EMAIL_PUERTO: z.coerce.number().optional(),
  EMAIL_USUARIO: z.string().email().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_REMITENTE_NOMBRE: z.string().default('Brisas de Calamuchita'),
});


// -------------------------------------------------------------
//   Parseo y validacion
// -------------------------------------------------------------
const resultado = schemaEnv.safeParse(process.env);

if (!resultado.success) {
  console.error('\n❌ Error en las variables de entorno:');
  console.error('   Revisa tu archivo .env contra .env.ejemplo\n');

  for (const error of resultado.error.errors) {
    const ruta = error.path.join('.');
    console.error(`   • ${ruta}: ${error.message}`);
  }
  console.error('');
  process.exit(1);
}


// -------------------------------------------------------------
//   Export
// -------------------------------------------------------------
// `env` es el objeto con todas las variables validadas y tipadas.
// Usalo en todo el codigo en lugar de process.env.
export const env = resultado.data;

// Helpers utiles
export const esDesarrollo = env.NODE_ENV === 'desarrollo';
export const esPruebas    = env.NODE_ENV === 'pruebas';
export const esProduccion = env.NODE_ENV === 'produccion';
