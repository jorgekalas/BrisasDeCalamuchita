// =============================================================
//   APP — CONFIGURACION DE EXPRESS
// =============================================================
//   Crea y configura la app de Express con todos sus
//   middlewares y rutas. NO levanta el servidor HTTP (eso lo
//   hace servidor.js).
//
//   Separar app.js de servidor.js permite importar la app
//   directamente en los tests con Supertest, sin necesidad de
//   levantar un puerto. Es el patron estandar en Express moderno.
// =============================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env, esDesarrollo, esPruebas } from './config/env.js';
import { rutasSalud } from './rutas/salud.js';
import { rutasAuth } from './rutas/auth.js';
import { rutasPropiedad } from './rutas/propiedad.js';
import { rutasReservas, rutasMisReservas } from './rutas/reservas.js';
import { rutasUsuarios } from './rutas/usuarios.js';
import { notFound } from './middlewares/notFound.js';
import { manejadorErrores } from './middlewares/manejadorErrores.js';

export const app = express();


// =============================================================
//   MIDDLEWARES GLOBALES
// =============================================================

// --- Seguridad: headers HTTP defensivos ---
// Helmet setea ~12 headers de seguridad (CSP, HSTS, X-Frame, etc.)
// que protegen contra ataques comunes (XSS, clickjacking, etc.).
app.use(helmet());

// --- CORS: permitir requests desde el frontend ---
// En desarrollo permitimos todo. En produccion solo el dominio
// del frontend (configurado via URL_FRONTEND).
app.use(cors({
  origin: esDesarrollo ? true : env.URL_FRONTEND,
  credentials: true,
}));

// --- Parsing del body ---
// Limite generoso para soportar payloads con observaciones
// largas, pero no infinito (proteccion contra DoS).
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --- Logger de requests ---
// 'dev' es un formato compacto con color por status code.
// En tests lo silenciamos para no ensuciar la salida.
if (!esPruebas) {
  app.use(morgan('dev'));
}


// =============================================================
//   RUTAS
// =============================================================

// Healthcheck. Lo dejamos fuera del prefijo /api para que
// algunos proveedores de monitoreo lo encuentren mas facil.
app.use('/api/salud', rutasSalud);

// Autenticacion: registro, login, datos del usuario actual.
app.use('/api/auth', rutasAuth);

// Recursos del negocio (Bloque 6 — CRUD basico)
app.use('/api/propiedad',    rutasPropiedad);
app.use('/api/reservas',     rutasReservas);
app.use('/api/mis-reservas', rutasMisReservas);
app.use('/api/usuarios',     rutasUsuarios);

// Endpoint raiz: mensaje informativo para que no de 404.
app.get('/', (_req, res) => {
  res.json({
    nombre: 'Brisas de Calamuchita - API',
    version: '0.1.0',
    estado: 'corriendo',
    documentacion: '/api/salud',
  });
});


// =============================================================
//   MANEJADORES DE ERRORES (deben ir AL FINAL)
// =============================================================

// 404 — si llegamos aca es que ninguna ruta atendio la request.
app.use(notFound);

// Manejador centralizado — captura cualquier error tirado en
// los middlewares o controladores anteriores y lo formatea.
app.use(manejadorErrores);
