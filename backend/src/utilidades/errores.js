// =============================================================
//   CLASES DE ERROR TIPADAS
// =============================================================
//   En lugar de hacer throw new Error('algo'), tiramos errores
//   tipados (NoEncontrado, NoAutorizado, ValidacionFallida, etc.).
//   Asi el manejador centralizado sabe que codigo HTTP devolver
//   y formatea la respuesta correctamente.
//
//   Uso desde un controlador:
//     if (!reserva) throw new NoEncontrado('Reserva no existe');
//     if (!esDuena) throw new NoAutorizado('No es tu reserva');
//     if (huespedes > 10) throw new ValidacionFallida('Maximo 10');
// =============================================================


// -------------------------------------------------------------
//   Clase base
// -------------------------------------------------------------
// Todos los errores de la aplicacion heredan de esta. La
// propiedad esEsperado=true es la clave: el manejador
// centralizado la usa para distinguir errores de negocio
// (que devolvemos al cliente) de bugs inesperados (que
// devolvemos como 500 con mensaje generico).
// -------------------------------------------------------------
export class ErrorApp extends Error {
  constructor(mensaje, codigoHttp = 500, codigoNegocio = 'ERROR_INTERNO') {
    super(mensaje);
    this.name = this.constructor.name;
    this.codigoHttp = codigoHttp;
    this.codigoNegocio = codigoNegocio;
    this.esEsperado = true;
  }
}


// -------------------------------------------------------------
//   400 — Validacion fallida
// -------------------------------------------------------------
// Datos invalidos enviados por el cliente (formato, tipo,
// reglas de negocio simples). En el Bloque 5 lo usaremos
// con Zod para mensajes detallados.
// -------------------------------------------------------------
export class ValidacionFallida extends ErrorApp {
  constructor(mensaje = 'Datos invalidos', detalles = null) {
    super(mensaje, 400, 'VALIDACION_FALLIDA');
    this.detalles = detalles;
  }
}


// -------------------------------------------------------------
//   401 — No autenticado
// -------------------------------------------------------------
// El cliente no envio credenciales o son invalidas.
// "No te conozco." Esto NO es lo mismo que 403.
// -------------------------------------------------------------
export class NoAutenticado extends ErrorApp {
  constructor(mensaje = 'Necesitas iniciar sesion') {
    super(mensaje, 401, 'NO_AUTENTICADO');
  }
}


// -------------------------------------------------------------
//   403 — No autorizado
// -------------------------------------------------------------
// El cliente esta logueado pero no tiene permisos para esto.
// "Te conozco pero no podes hacer esto."
// Ej: cliente intenta confirmar una reserva (es accion de admin).
// -------------------------------------------------------------
export class NoAutorizado extends ErrorApp {
  constructor(mensaje = 'No tenes permisos para esta accion') {
    super(mensaje, 403, 'NO_AUTORIZADO');
  }
}


// -------------------------------------------------------------
//   404 — No encontrado
// -------------------------------------------------------------
// El recurso solicitado no existe.
// -------------------------------------------------------------
export class NoEncontrado extends ErrorApp {
  constructor(mensaje = 'Recurso no encontrado') {
    super(mensaje, 404, 'NO_ENCONTRADO');
  }
}


// -------------------------------------------------------------
//   409 — Conflicto
// -------------------------------------------------------------
// La operacion choca con el estado actual.
// Ej: el email ya esta registrado, las fechas se solapan con
// otra reserva, etc.
// -------------------------------------------------------------
export class Conflicto extends ErrorApp {
  constructor(mensaje = 'Conflicto con el estado actual') {
    super(mensaje, 409, 'CONFLICTO');
  }
}


// -------------------------------------------------------------
//   422 — Regla de negocio violada
// -------------------------------------------------------------
// La solicitud es valida sintacticamente pero viola una
// regla de negocio especifica (ver documento base).
// Ej: cantidad de huespedes fuera del rango 4-10.
// -------------------------------------------------------------
export class ReglaDeNegocio extends ErrorApp {
  constructor(mensaje = 'Regla de negocio violada', codigoRegla = null) {
    super(mensaje, 422, codigoRegla || 'REGLA_NEGOCIO');
  }
}
