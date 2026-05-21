// =============================================================
//   ADAPTADOR — DISPONIBILIDAD BACKEND → CALENDARIO
// =============================================================
//   El backend devuelve la disponibilidad como una lista de
//   RANGOS de reservas:
//     [{ id, fecha_ingreso, fecha_egreso, estado }, ...]
//
//   El componente <Calendario /> espera una lista de FECHAS
//   individuales (un dia por fila):
//     [{ fecha: '2027-06-01', estado: 'Confirmada', reservaId: 33 }, ...]
//
//   Este helper hace el "explode" de los rangos a fechas.
//
//   Por que aca y no en el backend: el componente del calendario
//   itera por dia, asi que necesita una entrada por dia. El
//   backend devuelve rangos porque es mas compacto para la red
//   (un objeto por reserva vs ~5 por reserva). El adaptador
//   esta en el frontend porque la transformacion depende del
//   formato que necesita el componente.
// =============================================================


// -------------------------------------------------------------
//   expandirRangosAFechas(rangos) → array de dias
// -------------------------------------------------------------
//   rangos: array de objetos del backend con
//     { id, fecha_ingreso, fecha_egreso, estado }
//
//   Devuelve: array de fechas individuales, una por cada dia
//   del rango (inclusive ingreso, exclusive egreso porque el
//   dia de egreso ya esta libre por la noche).
// -------------------------------------------------------------
export function expandirRangosAFechas(rangos) {
  if (!Array.isArray(rangos)) return [];

  const fechas = [];

  for (const rango of rangos) {
    const ingreso = new Date(rango.fecha_ingreso);
    const egreso  = new Date(rango.fecha_egreso);

    // Iteramos dia por dia desde el ingreso hasta el dia anterior
    // al egreso (en el dia de egreso la casa ya queda libre).
    const cursor = new Date(ingreso);
    while (cursor < egreso) {
      fechas.push({
        fecha: cursor.toISOString().split('T')[0],
        estado: rango.estado,
        reservaId: rango.id,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return fechas;
}
