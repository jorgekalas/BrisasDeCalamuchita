// =============================================================
//   TESTS E2E — Reservas (maquina de estados completa)
// =============================================================
//   Cubre el flujo:
//     - Cliente crea reserva → Pendiente con bloqueo
//     - Admin confirma → Confirmada
//     - Cliente cancela / Admin check-in / Admin check-out
//     - Validaciones: solapamiento, capacidad, fechas
// =============================================================

import { jest } from '@jest/globals';
import request from 'supertest';

import { app } from '../../src/app.js';
import { resetearBD, cerrarPoolApp } from '../helpers/bd.js';
import { loginAdmin, loginMaria, loginPedro } from '../helpers/auth.js';


describe('Reservas (E2E)', () => {
  let tokenAdmin;
  let tokenMaria;
  let tokenPedro;

  beforeAll(async () => {
    await resetearBD();
    tokenAdmin = (await loginAdmin(app)).token;
    tokenMaria = (await loginMaria(app)).token;
    tokenPedro = (await loginPedro(app)).token;
  });

  afterAll(async () => {
    await cerrarPoolApp();
  });


  // =============================================================
  //   CREAR RESERVA
  // =============================================================
  describe('POST /api/reservas (crear)', () => {

    test('cliente crea reserva valida', async () => {
      const res = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${tokenMaria}`)
        .send({
          fecha_ingreso: '2027-11-01',
          fecha_egreso: '2027-11-05',
          cantidad_huespedes: 5,
          observaciones: 'Llegamos tarde',
        });

      expect(res.status).toBe(201);
      expect(res.body.datos.estado).toBe('Pendiente');
      expect(res.body.datos.bloqueo_hasta).toBeTruthy();
      expect(res.body.datos.cliente.email).toBe('maria@ejemplo.com');
    });

    test('cliente crea reserva con vehiculo (transaccion atomica)', async () => {
      const res = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${tokenMaria}`)
        .send({
          fecha_ingreso: '2027-12-01',
          fecha_egreso: '2027-12-05',
          cantidad_huespedes: 4,
          vehiculo: { patente: 'XY999ZZ', modelo: 'Renault Logan' },
        });

      expect(res.status).toBe(201);
      expect(res.body.datos.vehiculo).toBeTruthy();
      expect(res.body.datos.vehiculo.patente).toBe('XY999ZZ');
    });

    test('admin NO puede crear reserva (solo clientes)', async () => {
      const res = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          fecha_ingreso: '2028-01-01',
          fecha_egreso: '2028-01-05',
          cantidad_huespedes: 5,
        });

      expect(res.status).toBe(403);
    });

    test('solapamiento devuelve 409', async () => {
      // Una reserva en 2027-11-01..05 ya existe (creada arriba)
      const res = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${tokenPedro}`)
        .send({
          fecha_ingreso: '2027-11-03',
          fecha_egreso: '2027-11-07',
          cantidad_huespedes: 4,
        });

      expect(res.status).toBe(409);
      expect(res.body.error.codigo).toBe('CONFLICTO');
    });

    test('rechaza fecha pasada', async () => {
      const res = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${tokenMaria}`)
        .send({
          fecha_ingreso: '2020-01-01',
          fecha_egreso: '2020-01-05',
          cantidad_huespedes: 5,
        });

      expect(res.status).toBe(400);
    });

    test('rechaza cantidad de huespedes fuera de rango', async () => {
      const res = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${tokenMaria}`)
        .send({
          fecha_ingreso: '2028-02-01',
          fecha_egreso: '2028-02-05',
          cantidad_huespedes: 15,   // max 10
        });

      expect(res.status).toBe(400);
    });

    test('rechaza fecha_egreso anterior a fecha_ingreso', async () => {
      const res = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${tokenMaria}`)
        .send({
          fecha_ingreso: '2028-03-05',
          fecha_egreso: '2028-03-01',
          cantidad_huespedes: 5,
        });

      expect(res.status).toBe(400);
    });
  });


  // =============================================================
  //   MAQUINA DE ESTADOS
  // =============================================================
  describe('Maquina de estados', () => {
    let idReserva;

    beforeAll(async () => {
      // Crear una reserva para esta suite especifica
      const res = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${tokenMaria}`)
        .send({
          fecha_ingreso: '2028-05-01',
          fecha_egreso: '2028-05-05',
          cantidad_huespedes: 5,
        });
      idReserva = res.body.datos.id;
    });

    test('cliente NO puede confirmar (solo admin)', async () => {
      const res = await request(app)
        .post(`/api/reservas/${idReserva}/confirmar`)
        .set('Authorization', `Bearer ${tokenMaria}`);

      expect(res.status).toBe(403);
    });

    test('admin confirma: pasa a Confirmada y limpia bloqueo', async () => {
      const res = await request(app)
        .post(`/api/reservas/${idReserva}/confirmar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.datos.estado).toBe('Confirmada');
      expect(res.body.datos.bloqueo_hasta).toBeNull();
      expect(res.body.datos.confirmada_en).toBeTruthy();
    });

    test('doble confirmacion: 422 (regla de negocio)', async () => {
      const res = await request(app)
        .post(`/api/reservas/${idReserva}/confirmar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(422);
      expect(res.body.error.codigo).toBe('REGLA_NEGOCIO');
    });

    test('cliente NO puede cancelar reserva de otro cliente', async () => {
      const res = await request(app)
        .post(`/api/reservas/${idReserva}/cancelar`)
        .set('Authorization', `Bearer ${tokenPedro}`);

      expect(res.status).toBe(403);
    });

    test('admin cancela cualquier reserva', async () => {
      // Crear otra para no romper la del flujo
      const crear = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${tokenMaria}`)
        .send({
          fecha_ingreso: '2028-06-01',
          fecha_egreso: '2028-06-05',
          cantidad_huespedes: 4,
        });
      const id = crear.body.datos.id;

      const res = await request(app)
        .post(`/api/reservas/${id}/cancelar`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.datos.estado).toBe('Cancelada');
    });

    test('no se puede cancelar una ya cancelada', async () => {
      // Buscamos la que cancelamos arriba (vamos a la 6)
      // En lugar de hardcodear, hacemos GET y obtenemos la primera cancelada
      const lista = await request(app)
        .get('/api/reservas?estado=Cancelada&porPagina=1')
        .set('Authorization', `Bearer ${tokenAdmin}`);
      const idCancelada = lista.body.datos[0]?.id;

      if (idCancelada) {
        const res = await request(app)
          .post(`/api/reservas/${idCancelada}/cancelar`)
          .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.status).toBe(422);
      }
    });
  });


  // =============================================================
  //   LISTADO Y FILTROS
  // =============================================================
  describe('GET /api/reservas (admin)', () => {

    test('admin lista con paginacion', async () => {
      const res = await request(app)
        .get('/api/reservas?pagina=1&porPagina=5')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.datos.length).toBeLessThanOrEqual(5);
      expect(res.body.metadata.paginacion).toBeDefined();
      expect(res.body.metadata.paginacion.total).toBeGreaterThan(0);
    });

    test('filtro por estado funciona', async () => {
      const res = await request(app)
        .get('/api/reservas?estado=Confirmada')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      // Todas las reservas devueltas deben ser Confirmada
      for (const r of res.body.datos) {
        expect(r.estado).toBe('Confirmada');
      }
    });

    test('cliente NO puede listar todas las reservas', async () => {
      const res = await request(app)
        .get('/api/reservas')
        .set('Authorization', `Bearer ${tokenMaria}`);

      expect(res.status).toBe(403);
    });

    test('JOIN trae cliente, pago y vehiculo anidados', async () => {
      const res = await request(app)
        .get('/api/reservas?porPagina=1')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      const reserva = res.body.datos[0];
      expect(reserva.cliente).toBeDefined();
      expect(reserva.cliente.email).toBeTruthy();
      // pago y vehiculo pueden ser null pero las claves existen
      expect('pago' in reserva).toBe(true);
      expect('vehiculo' in reserva).toBe(true);
    });
  });


  // =============================================================
  //   MIS RESERVAS
  // =============================================================
  describe('GET /api/mis-reservas (cliente)', () => {

    test('cliente ve solo sus reservas', async () => {
      const res = await request(app)
        .get('/api/mis-reservas')
        .set('Authorization', `Bearer ${tokenMaria}`);

      expect(res.status).toBe(200);
      // Todas deben ser de Maria (id=2)
      for (const r of res.body.datos) {
        expect(r.cliente.id).toBe(2);
      }
    });

    test('sin token: 401', async () => {
      const res = await request(app).get('/api/mis-reservas');
      expect(res.status).toBe(401);
    });
  });


  // =============================================================
  //   DISPONIBILIDAD
  // =============================================================
  describe('GET /api/reservas/disponibilidad (publico)', () => {

    test('devuelve solo reservas no canceladas', async () => {
      const res = await request(app).get('/api/reservas/disponibilidad');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.datos)).toBe(true);
      // Ninguna devuelta debe estar Cancelada o Finalizada
      for (const r of res.body.datos) {
        expect(['Pendiente', 'Confirmada', 'En curso']).toContain(r.estado);
      }
    });

    test('acepta rango de fechas', async () => {
      const res = await request(app)
        .get('/api/reservas/disponibilidad?desde=2027-01-01&hasta=2027-12-31');

      expect(res.status).toBe(200);
    });

    test('rechaza fechas mal formateadas', async () => {
      const res = await request(app)
        .get('/api/reservas/disponibilidad?desde=hoy');

      expect(res.status).toBe(400);
    });
  });
});
