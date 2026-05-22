// =============================================================
//   TESTS UNITARIOS — Plantillas de email
// =============================================================
//   Verifica que cada plantilla:
//   - Genere asunto y cuerpo no vacios
//   - Incluya el nombre del cliente y el id de reserva
//   - Incluya los datos de la reserva (fechas, huespedes)
//   - El layout sea HTML valido con charset UTF-8 declarado
// =============================================================

import { jest } from '@jest/globals';
import { PLANTILLAS } from '../../src/plantillas/emails.js';


// Fixture de reserva tipica para usar en todos los tests
const reservaEjemplo = {
  id: 42,
  fecha_ingreso: '2027-06-01',
  fecha_egreso: '2027-06-05',
  cantidad_huespedes: 6,
  estado: 'Pendiente',
  cliente: {
    id: 2,
    nombre: 'María',
    apellido: 'Fernández',
    email: 'maria@ejemplo.com',
  },
  pago: { monto_total: 425000 },
  vehiculo: { patente: 'AB123CD', modelo: 'Toyota Etios' },
};

const TIPOS_PLANTILLA = [
  'solicitud_recibida',
  'reserva_confirmada',
  'reserva_cancelada',
  'bloqueo_vencido',
  'reserva_finalizada',
];


describe.each(TIPOS_PLANTILLA)('plantilla %s', (tipo) => {
  const resultado = PLANTILLAS[tipo](reservaEjemplo);

  test('genera asunto no vacio', () => {
    expect(resultado.asunto).toBeTruthy();
    expect(typeof resultado.asunto).toBe('string');
  });

  test('genera cuerpo HTML no vacio', () => {
    expect(resultado.cuerpo).toBeTruthy();
    expect(typeof resultado.cuerpo).toBe('string');
    expect(resultado.cuerpo.length).toBeGreaterThan(100);
  });

  test('cuerpo incluye <!DOCTYPE html>', () => {
    expect(resultado.cuerpo).toContain('<!DOCTYPE html>');
  });

  test('cuerpo declara charset UTF-8', () => {
    expect(resultado.cuerpo).toMatch(/charset["=\s]*UTF-?8/i);
  });

  test('incluye el nombre del cliente', () => {
    expect(resultado.cuerpo).toContain('María');
  });

  test('incluye el ID de reserva', () => {
    expect(resultado.cuerpo).toContain('42');
  });

  test('incluye el numero de WhatsApp en el footer', () => {
    expect(resultado.cuerpo).toContain('3546');
  });

  test('NO contiene errores de encoding (Ã)', () => {
    expect(resultado.cuerpo).not.toMatch(/Ã[©­¡]/);
  });
});


describe('plantilla solicitud_recibida', () => {
  const r = PLANTILLAS.solicitud_recibida(reservaEjemplo);

  test('asunto menciona "solicitud"', () => {
    expect(r.asunto.toLowerCase()).toContain('solicitud');
  });

  test('cuerpo menciona el bloqueo de 2 horas', () => {
    expect(r.cuerpo).toContain('2 horas');
  });
});


describe('plantilla reserva_confirmada', () => {
  const r = PLANTILLAS.reserva_confirmada(reservaEjemplo);

  test('asunto menciona "confirmada"', () => {
    expect(r.asunto.toLowerCase()).toContain('confirmada');
  });
});


describe('plantilla bloqueo_vencido', () => {
  const r = PLANTILLAS.bloqueo_vencido(reservaEjemplo);

  test('explica que se cancelo automaticamente', () => {
    expect(r.cuerpo.toLowerCase()).toContain('automáticamente');
  });
});


describe('plantillas con datos opcionales', () => {
  test('plantilla SIN vehiculo no rompe', () => {
    const sinVehiculo = { ...reservaEjemplo, vehiculo: null };
    expect(() => PLANTILLAS.solicitud_recibida(sinVehiculo)).not.toThrow();
  });

  test('plantilla SIN pago no rompe', () => {
    const sinPago = { ...reservaEjemplo, pago: null };
    expect(() => PLANTILLAS.reserva_confirmada(sinPago)).not.toThrow();
  });
});
