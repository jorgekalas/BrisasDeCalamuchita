import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ESTADOS } from '../datos/constantes';

/**
 * Calendario mensual de disponibilidad.
 * Props:
 *  - modo: 'visualizar' | 'seleccionar'
 *  - onSeleccionRango: callback({ desde, hasta }) cuando se completa una selección
 *  - fechasOcupadas: array de { fecha, estado, reservaId }.
 *      Lo pasa la pagina padre (Disponibilidad) usando los datos del backend
 *      via expandirRangosAFechas().
 */
const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const NOMBRES_DIA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function Calendario({ modo = 'visualizar', onSeleccionRango, fechasOcupadas = [] }) {
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [seleccion, setSeleccion] = useState({ desde: null, hasta: null });

  // Construir grilla del mes
  const grilla = useMemo(() => {
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    // 0 = domingo en JS, queremos lunes = 0
    const inicio = (primerDia.getDay() + 6) % 7;
    const dias = [];

    for (let i = 0; i < inicio; i++) dias.push(null);
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const fecha = new Date(anio, mes, d);
      const iso = fecha.toISOString().split('T')[0];
      const ocupada = fechasOcupadas.find((f) => f.fecha === iso);
      const esPasada = fecha < new Date(hoy.toDateString());
      dias.push({ dia: d, iso, ocupada, esPasada });
    }
    return dias;
  }, [anio, mes, fechasOcupadas]);

  const mover = (delta) => {
    const nuevoMes = mes + delta;
    if (nuevoMes < 0) { setMes(11); setAnio(anio - 1); }
    else if (nuevoMes > 11) { setMes(0); setAnio(anio + 1); }
    else setMes(nuevoMes);
  };

  const handleClickDia = (dia) => {
    if (!dia || dia.esPasada || dia.ocupada || modo !== 'seleccionar') return;

    if (!seleccion.desde || (seleccion.desde && seleccion.hasta)) {
      // Empezar nueva selección
      const nueva = { desde: dia.iso, hasta: null };
      setSeleccion(nueva);
      onSeleccionRango?.(nueva);
    } else {
      // Completar selección
      if (dia.iso <= seleccion.desde) {
        const nueva = { desde: dia.iso, hasta: null };
        setSeleccion(nueva);
        onSeleccionRango?.(nueva);
      } else {
        // Validar que no haya fechas ocupadas en el medio
        const tieneOcupadasEnMedio = fechasOcupadas.some((f) => f.fecha > seleccion.desde && f.fecha < dia.iso);
        if (tieneOcupadasEnMedio) {
          // Reseteamos la selección
          const nueva = { desde: dia.iso, hasta: null };
          setSeleccion(nueva);
          onSeleccionRango?.(nueva);
          return;
        }
        const nueva = { desde: seleccion.desde, hasta: dia.iso };
        setSeleccion(nueva);
        onSeleccionRango?.(nueva);
      }
    }
  };

  const estaEnSeleccion = (iso) => {
    if (!seleccion.desde) return false;
    if (!seleccion.hasta) return iso === seleccion.desde;
    return iso >= seleccion.desde && iso <= seleccion.hasta;
  };

  return (
    <div className="tarjeta">
      {/* Encabezado del mes */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => mover(-1)}
          className="p-2 rounded-full hover:bg-crema-200 transition-colors text-piedra-700"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-display text-xl text-piedra-900">
          {NOMBRES_MES[mes]} <span className="text-piedra-600">{anio}</span>
        </h3>
        <button
          onClick={() => mover(1)}
          className="p-2 rounded-full hover:bg-crema-200 transition-colors text-piedra-700"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Encabezado de dias */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs uppercase tracking-widest text-piedra-600">
        {NOMBRES_DIA.map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
      </div>

      {/* Grilla del mes */}
      <div className="grid grid-cols-7 gap-2">
        {grilla.map((dia, i) => {
          if (!dia) return <div key={i} />;
          const enSel = estaEnSeleccion(dia.iso);

          let clases = 'aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all relative group ';
          if (dia.esPasada) {
            // Fondo gris + cursor no-allowed para que se note que no es clickeable
            clases += 'bg-piedra-200/40 text-piedra-400 cursor-not-allowed';
          } else if (dia.ocupada) {
            if (dia.ocupada.estado === ESTADOS.PENDIENTE) {
              clases += 'bg-amber-100 text-amber-800 cursor-not-allowed line-through';
            } else {
              clases += 'bg-red-50 text-red-700 cursor-not-allowed line-through';
            }
          } else if (enSel) {
            clases += 'bg-musgo-700 text-crema-50 cursor-pointer';
          } else if (modo === 'seleccionar') {
            clases += 'text-piedra-900 hover:bg-musgo-100 cursor-pointer';
          } else {
            clases += 'text-piedra-900';
          }

          return (
            <button
              key={i}
              onClick={() => handleClickDia(dia)}
              className={clases}
              disabled={!dia || dia.esPasada || dia.ocupada || modo !== 'seleccionar'}
              type="button"
              title={dia.esPasada ? 'Fecha anterior, no disponible' : undefined}
            >
              <span className={dia.esPasada ? 'group-hover:opacity-0 transition-opacity' : ''}>
                {dia.dia}
              </span>
              {dia.esPasada && (
                // Candado SVG inline que aparece al hover, indicando que no se puede clickear
                <svg
                  className="absolute opacity-0 group-hover:opacity-100 transition-opacity text-piedra-500"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-6 pt-4 border-t border-crema-200 flex flex-wrap gap-4 text-xs text-piedra-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-musgo-700" />
          <span>Tu selección</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-100 border border-amber-300" />
          <span>En proceso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-50 border border-red-200" />
          <span>Reservada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-piedra-200/40 border border-piedra-200" />
          <span>Pasada</span>
        </div>
      </div>
    </div>
  );
}
