// =============================================================
//   TESTS E2E — Autenticacion
// =============================================================
//   Levanta la app real, le pega con HTTP a /api/auth/*,
//   verifica que los flujos completos funcionen contra MySQL.
// =============================================================

import { jest } from '@jest/globals';
import request from 'supertest';

// Importamos despues de que setup-env.js corra
import { app } from '../../src/app.js';
import { resetearBD, cerrarPoolApp } from '../helpers/bd.js';


describe('Autenticacion (E2E)', () => {

  // Antes de toda la suite: BD fresca
  beforeAll(async () => {
    await resetearBD();
  });

  // Al final: cerrar pool
  afterAll(async () => {
    await cerrarPoolApp();
  });


  // ========== REGISTRO ==========
  describe('POST /api/auth/registro', () => {

    test('crea un cliente nuevo con datos validos', async () => {
      const res = await request(app)
        .post('/api/auth/registro')
        .send({
          email: 'nuevo@ejemplo.com',
          password: 'pass1234',
          nombre: 'Juan',
          apellido: 'Perez',
        });

      expect(res.status).toBe(201);
      expect(res.body.exito).toBe(true);
      expect(res.body.datos.usuario.email).toBe('nuevo@ejemplo.com');
      expect(res.body.datos.usuario.tipo).toBe('cliente');
      expect(res.body.datos.token).toBeTruthy();
      // El backend nunca debe devolver el password
      expect(res.body.datos.usuario.password_hash).toBeUndefined();
    });

    test('rechaza email duplicado con 409', async () => {
      const res = await request(app)
        .post('/api/auth/registro')
        .send({
          email: 'maria@ejemplo.com',   // ya existe en seeds
          password: 'pass1234',
          nombre: 'X',
          apellido: 'Y',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.codigo).toBe('CONFLICTO');
    });

    test('rechaza password corto', async () => {
      const res = await request(app)
        .post('/api/auth/registro')
        .send({
          email: 'a@b.com',
          password: '1234',  // menos de 8
          nombre: 'X',
          apellido: 'Y',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.codigo).toBe('VALIDACION_FALLIDA');
    });

    test('rechaza email invalido', async () => {
      const res = await request(app)
        .post('/api/auth/registro')
        .send({
          email: 'no-es-email',
          password: 'pass1234',
          nombre: 'X',
          apellido: 'Y',
        });

      expect(res.status).toBe(400);
    });
  });


  // ========== LOGIN ==========
  describe('POST /api/auth/login', () => {

    test('login OK devuelve token y usuario', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'maria@ejemplo.com', password: 'demo1234' });

      expect(res.status).toBe(200);
      expect(res.body.datos.token).toBeTruthy();
      expect(res.body.datos.usuario.email).toBe('maria@ejemplo.com');
      expect(res.body.datos.usuario.tipo).toBe('cliente');
    });

    test('password incorrecto: 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'maria@ejemplo.com', password: 'mal-password' });

      expect(res.status).toBe(401);
      expect(res.body.error.codigo).toBe('NO_AUTENTICADO');
    });

    test('email inexistente: 401 (no 404, para no filtrar info)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'no-existe@x.com', password: 'lalala' });

      expect(res.status).toBe(401);
    });
  });


  // ========== /yo ==========
  describe('GET /api/auth/yo', () => {
    let tokenMaria;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'maria@ejemplo.com', password: 'demo1234' });
      tokenMaria = res.body.datos.token;
    });

    test('con token valido devuelve usuario', async () => {
      const res = await request(app)
        .get('/api/auth/yo')
        .set('Authorization', `Bearer ${tokenMaria}`);

      expect(res.status).toBe(200);
      expect(res.body.datos.usuario.email).toBe('maria@ejemplo.com');
    });

    test('sin token: 401', async () => {
      const res = await request(app).get('/api/auth/yo');
      expect(res.status).toBe(401);
    });

    test('con token mal formado: 401', async () => {
      const res = await request(app)
        .get('/api/auth/yo')
        .set('Authorization', 'Bearer token-falso');

      expect(res.status).toBe(401);
    });
  });
});
