// =============================================================
//   TESTS UNITARIOS — Servicio de propiedad
// =============================================================
//   Estos tests NO tocan la BD. Mockeamos el modelo y testeamos
//   solo la logica del servicio (reglas de negocio, validaciones).
// =============================================================

import { jest } from '@jest/globals';

// Mockear el modelo ANTES de importar el servicio
jest.unstable_mockModule('../../src/modelos/propiedadModelo.js', () => ({
  buscarPorId: jest.fn(),
  listarActivas: jest.fn(),
  actualizar: jest.fn(),
}));

const propiedadModelo = await import('../../src/modelos/propiedadModelo.js');
const propiedadServicio = await import('../../src/servicios/propiedadServicio.js');
const errores = await import('../../src/utilidades/errores.js');


describe('propiedadServicio.listar', () => {
  test('devuelve lo que entrega el modelo', async () => {
    const fixture = [{ id: 1, nombre: 'Brisas' }];
    propiedadModelo.listarActivas.mockResolvedValueOnce(fixture);

    const r = await propiedadServicio.listar();
    expect(r).toEqual(fixture);
    expect(propiedadModelo.listarActivas).toHaveBeenCalledTimes(1);
  });
});


describe('propiedadServicio.obtener', () => {
  test('devuelve la propiedad si existe', async () => {
    propiedadModelo.buscarPorId.mockResolvedValueOnce({ id: 1, nombre: 'Brisas' });
    const r = await propiedadServicio.obtener(1);
    expect(r.nombre).toBe('Brisas');
  });

  test('lanza NoEncontrado si no existe', async () => {
    propiedadModelo.buscarPorId.mockResolvedValueOnce(null);
    await expect(propiedadServicio.obtener(999)).rejects.toThrow(errores.NoEncontrado);
  });
});


describe('propiedadServicio.actualizar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('valida que capacidad_minima sea <= capacidad_maxima', async () => {
    propiedadModelo.buscarPorId.mockResolvedValueOnce({
      id: 1, capacidad_minima: 4, capacidad_maxima: 10,
    });

    await expect(
      propiedadServicio.actualizar(1, { capacidad_minima: 15, capacidad_maxima: 10 })
    ).rejects.toThrow(errores.ValidacionFallida);
  });

  test('permite actualizar solo capacidad_minima si queda valida', async () => {
    propiedadModelo.buscarPorId.mockResolvedValue({
      id: 1, capacidad_minima: 4, capacidad_maxima: 10,
    });
    propiedadModelo.actualizar.mockResolvedValueOnce({
      id: 1, capacidad_minima: 6, capacidad_maxima: 10,
    });

    const r = await propiedadServicio.actualizar(1, { capacidad_minima: 6 });
    expect(r.capacidad_minima).toBe(6);
    expect(propiedadModelo.actualizar).toHaveBeenCalledWith(1, { capacidad_minima: 6 });
  });

  test('falla si la propiedad no existe Y se cambia capacidad', async () => {
    propiedadModelo.buscarPorId.mockResolvedValueOnce(null);

    await expect(
      propiedadServicio.actualizar(999, { capacidad_minima: 5 })
    ).rejects.toThrow(errores.NoEncontrado);
  });

  test('permite cambios que NO afectan capacidad sin chequear BD', async () => {
    propiedadModelo.actualizar.mockResolvedValueOnce({
      id: 1, precio_por_noche: 100000,
    });

    const r = await propiedadServicio.actualizar(1, { precio_por_noche: 100000 });
    expect(r.precio_por_noche).toBe(100000);
    // No deberia haber llamado a buscarPorId en este caso
    expect(propiedadModelo.buscarPorId).not.toHaveBeenCalled();
  });
});
