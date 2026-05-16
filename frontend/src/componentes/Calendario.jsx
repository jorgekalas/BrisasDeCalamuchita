import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ESTADOS, obtenerFechasOcupadas } from '../datos/mock';
import { useApp } from '../ContextoApp';

/**
 * Calendario mensual de disponibilidad.
 * Props:
 *  - modo: 'visualizar' | 'seleccionar'
 *  - onSeleccionRango: callback({ desde, hasta }) cuando se completa una selección
 */
const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const NOMBRES_DIA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function Calendario({ modo = 'visualizar', onSeleccionRango }) {
  const { reservas } = useApp();
  const fechasOcupadas = useMemo(() => obtenerFechasOcupadas(reservas), [reservas]);

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

  const handleClickDia = (celda) => {
    if (!celda || celda.esPasada || celda.ocupada) return;
    if (modo !== 'seleccionar') return;

    if (!seleccion.desde || (seleccion.desde && seleccion.hasta)) {
      const nueva = { desde: celda.iso, hasta: null };
      setSeleccion(nueva);
    } else {
      const desde = new Date(seleccion.desde);
      const clic = new Date(celda.iso);
      if (clic <= desde) {
        setSeleccion({ desde: celda.iso, hasta: null });
      } else {
        const nueva = { desde: seleccion.desde, hasta: celda.iso };
        setSeleccion(nueva);
        onSeleccionRango?.(nueva);
      }
    }
  };

  const estaEnRango = (iso) => {
    if (!seleccion.desde) return false;
    const d = new Date(iso);
    const inicio = new Date(seleccion.desde);
    const fin = seleccion.hasta ? new Date(seleccion.hasta) : inicio;
    return d >= inicio && d <= fin;
  };

  return (
    <div className="tarjeta">
      {/* Navegación de mes */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => mover(-1)}
          className="p-2 rounded-full hover:bg-crema-200 transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={20} className="text-musgo-700" />
        </button>
        <h3 className="font-display text-xl text-musgo-800">
          {NOMBRES_MES[mes]} <span className="text-piedra-600">{anio}</span>
        </h3>
        <button
          onClick={() => mover(1)}
          className="p-2 rounded-full hover:bg-crema-200 transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={20} className="text-musgo-700" />
        </button>
      </div>

      {/* Nombres de día */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {NOMBRES_DIA.map((n, i) => (
          <div key={i} className="text-center text-xs font-medium text-piedra-600 py-2">{n}</div>
        ))}
      </div>

      {/* Grilla */}
      <div className="grid grid-cols-7 gap-1">
        {grilla.map((celda, i) => {
          if (!celda) return <div key={i} />;
          const enRango = estaEnRango(celda.iso);
          const esExtremo = celda.iso === seleccion.desde || celda.iso === seleccion.hasta;

          let clases = 'aspect-square flex items-center justify-center text-sm rounded-xl transition-all duration-200 relative ';
          if (celda.esPasada) clases += 'text-piedra-600/40 cursor-not-allowed';
          else if (celda.ocupada?.estado === ESTADOS.CONFIRMADA) clases += 'bg-terracota-100 text-terracota-800 cursor-not-allowed line-through';
          else if (celda.ocupada?.estado === ESTADOS.PENDIENTE) clases += 'bg-amber-100 text-amber-800 cursor-not-allowed';
          else if (esExtremo) clases += 'bg-musgo-700 text-crema-50 font-semibold scale-105';
          else if (enRango) clases += 'bg-musgo-100 text-musgo-800';
          else clases += 'hover:bg-crema-200 hover:text-musgo-700 cursor-pointer text-piedra-900';

          return (
            <button
              key={i}
              onClick={() => handleClickDia(celda)}
              className={clases}
              disabled={celda.esPasada || !!celda.ocupada}
              title={
                celda.ocupada?.estado === ESTADOS.CONFIRMADA ? 'Reservado' :
                celda.ocupada?.estado === ESTADOS.PENDIENTE ? 'Pendiente de confirmación' :
                'Disponible'
              }
            >
              {celda.dia}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-6 pt-6 border-t border-crema-200 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-crema-200" /> Disponible</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-200" /> Pendiente</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-terracota-200" /> Reservado</div>
        {modo === 'seleccionar' && (
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-musgo-700" /> Tu selección</div>
        )}
      </div>
    </div>
  );
}
