// =============================================================
//   TESTS E2E — Propiedad
// =============================================================

import { jest } from '@jest/globals';
import request from 'supertest';

import { app } from '../../src/app.js';
import { resetearBD, cerrarPoolApp } from '../helpers/bd.js';
import { loginAdmin, loginMaria } from '../helpers/auth.js';


describe('Propiedad (E2E)', () => {
  let tokenAdmin;
  let tokenMaria;

  beforeAll(async () => {
    await resetearBD();
    tokenAdmin = (await loginAdmin(app)).token;
    tokenMaria = (await loginMaria(app)).token;
  });

  afterAll(async () => {
    await cerrarPoolApp();
  });


  describe('GET /api/propiedad', () => {
    test('endpoint publico devuelve listado', async () => {
      const res = await request(app).get('/api/propiedad');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.datos)).toBe(true);
      expect(res.body.datos.length).toBeGreaterThanOrEqual(1);
    });

    test('cada propiedad tiene los campos esperados', async () => {
      const res = await request(app).get('/api/propiedad');
      const p = res.body.datos[0];

      expect(p.nombre).toBeTruthy();
      expect(p.ubicacion).toBeTruthy();
      expect(typeof p.precio_por_noche).toBe('string');  // mysql2 devuelve DECIMAL como string
      expect(typeof p.capacidad_minima).toBe('number');
      expect(typeof p.capacidad_maxima).toBe('number');
    });
  });


  describe('GET /api/propiedad/:id', () => {
    test('devuelve propiedad por ID', async () => {
      const res = await request(app).get('/api/propiedad/1');
      expect(res.status).toBe(200);
      expect(res.body.datos.id).toBe(1);
    });

    test('404 si no existe', async () => {
      const res = await request(app).get('/api/propiedad/999');
      expect(res.status).toBe(404);
    });
  });


  describe('PUT /api/propiedad/:id', () => {
    test('sin token: 401', async () => {
      const res = await request(app)
        .put('/api/propiedad/1')
        .send({ precio_por_noche: 100000 });
      expect(res.status).toBe(401);
    });

    test('cliente NO puede editar: 403', async () => {
      const res = await request(app)
        .put('/api/propiedad/1')
        .set('Authorization', `Bearer ${tokenMaria}`)
        .send({ precio_por_noche: 100000 });
      expect(res.status).toBe(403);
    });

    test('admin actualiza precio OK', async () => {
      const res = await request(app)
        .put('/api/propiedad/1')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ precio_por_noche: 100000 });

      expect(res.status).toBe(200);
      expect(Number(res.body.datos.precio_por_noche)).toBe(100000);
    });

    test('admin: capacidad minima > maxima → 400', async () => {
      const res = await request(app)
        .put('/api/propiedad/1')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ capacidad_minima: 15, capacidad_maxima: 10 });

      expect(res.status).toBe(400);
    });
  });
});
