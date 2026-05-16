import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Calendar, Award } from 'lucide-react';
import { formatearPrecio } from '../utilidades/formato';

/**
 * Modal con gráfico de evolución mensual de ingresos.
 * - Barras: ingreso del mes
 * - Línea: acumulado del año (tendencia)
 * - Hover: muestra valores exactos
 *
 * El gráfico es SVG puro (sin librerías externas) para mantener el bundle liviano
 * y darle un estilo orgánico coherente con el resto de la demo.
 */
export default function ModalIngresos({ datos, anio, total, onCerrar }) {
  const [mesHover, setMesHover] = useState(null);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCerrar]);

  // --- KPIs derivados ---
  const mesesConIngreso = datos.filter((d) => d.ingreso > 0);
  const mesTop = mesesConIngreso.reduce(
    (max, d) => (d.ingreso > max.ingreso ? d : max),
    { mes: '—', ingreso: 0 }
  );
  const promedio = mesesConIngreso.length > 0
    ? total / mesesConIngreso.length
    : 0;

  // --- Dimensiones del gráfico ---
  const ANCHO = 720;
  const ALTO = 320;
  const PAD = { top: 30, right: 30, bottom: 50, left: 80 };
  const anchoUtil = ANCHO - PAD.left - PAD.right;
  const altoUtil = ALTO - PAD.top - PAD.bottom;

  const maxIngreso = Math.max(...datos.map((d) => d.ingreso), 1);
  const maxAcumulado = Math.max(...datos.map((d) => d.acumulado), 1);
  const anchoBarra = anchoUtil / datos.length;

  // Escalas
  const escalaY = (v) => PAD.top + altoUtil - (v / maxIngreso) * altoUtil;
  const escalaYAcum = (v) => PAD.top + altoUtil - (v / maxAcumulado) * altoUtil;
  const escalaX = (i) => PAD.left + i * anchoBarra + anchoBarra / 2;

  // Líneas de grilla (cada 25%)
  const lineasGrilla = [0, 0.25, 0.5, 0.75, 1].map((frac) => ({
    y: PAD.top + altoUtil - frac * altoUtil,
    valor: maxIngreso * frac,
  }));

  // Path de la línea acumulada
  const pathAcumulado = datos
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${escalaX(i)} ${escalaYAcum(d.acumulado)}`)
    .join(' ');

  // Path del área bajo la línea (sutil sombreado)
  const pathArea = `${pathAcumulado} L ${escalaX(datos.length - 1)} ${PAD.top + altoUtil} L ${escalaX(0)} ${PAD.top + altoUtil} Z`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCerrar}
        className="fixed inset-0 z-50 bg-piedra-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-ingresos"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-crema-50 rounded-organico shadow-calido max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-crema-200 sticky top-0 bg-crema-50 z-10">
            <div>
              <div className="text-xs uppercase tracking-widest text-terracota-600 mb-1">Análisis financiero</div>
              <h2 id="titulo-modal-ingresos" className="font-display text-3xl text-piedra-900">
                Evolución de <span className="italic text-musgo-700">ingresos {anio}</span>
              </h2>
            </div>
            <button
              onClick={onCerrar}
              className="p-2 rounded-full hover:bg-crema-200 transition-colors"
              aria-label="Cerrar"
            >
              <X size={20} className="text-piedra-700" />
            </button>
          </div>

          {/* KPIs superiores */}
          <div className="px-8 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MiniKpi icono={TrendingUp} titulo={`Total ${anio}`} valor={formatearPrecio(total)} color="terracota" />
            <MiniKpi icono={Award} titulo="Mejor mes" valor={mesTop.mes} sub={formatearPrecio(mesTop.ingreso)} color="musgo" />
            <MiniKpi icono={Calendar} titulo="Promedio mensual" valor={formatearPrecio(promedio)} sub={`${mesesConIngreso.length} meses con ingresos`} color="piedra" />
          </div>

          {/* Gráfico */}
          <div className="px-8 py-6 overflow-x-auto">
            <svg
              viewBox={`0 0 ${ANCHO} ${ALTO}`}
              className="w-full h-auto max-w-full"
              role="img"
              aria-label="Gráfico de ingresos mensuales con línea de tendencia acumulada"
            >
              {/* Líneas de grilla horizontales */}
              {lineasGrilla.map((linea, i) => (
                <g key={i}>
                  <line
                    x1={PAD.left}
                    y1={linea.y}
                    x2={ANCHO - PAD.right}
                    y2={linea.y}
                    stroke="#ece1cd"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={PAD.left - 10}
                    y={linea.y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="#6a625a"
                    fontFamily="Outfit, sans-serif"
                  >
                    {linea.valor === 0 ? '$0' : `$${Math.round(linea.valor / 1000)}k`}
                  </text>
                </g>
              ))}

              {/* Área bajo línea acumulada */}
              <path d={pathArea} fill="#3d5b3c" fillOpacity="0.05" />

              {/* Barras */}
              {datos.map((d, i) => {
                const altoBarra = (d.ingreso / maxIngreso) * altoUtil;
                const xBarra = escalaX(i) - (anchoBarra * 0.35);
                const yBarra = PAD.top + altoUtil - altoBarra;
                const esHover = mesHover === i;
                return (
                  <g key={i}>
                    {/* Zona de hover invisible (más ancha que la barra) */}
                    <rect
                      x={PAD.left + i * anchoBarra}
                      y={PAD.top}
                      width={anchoBarra}
                      height={altoUtil}
                      fill="transparent"
                      onMouseEnter={() => setMesHover(i)}
                      onMouseLeave={() => setMesHover(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    {/* Barra */}
                    {d.ingreso > 0 && (
                      <rect
                        x={xBarra}
                        y={yBarra}
                        width={anchoBarra * 0.7}
                        height={altoBarra}
                        fill={esHover ? '#b25e3f' : '#c97b5a'}
                        rx="4"
                        style={{ transition: 'fill 0.2s' }}
                      />
                    )}
                    {/* Etiqueta mes */}
                    <text
                      x={escalaX(i)}
                      y={ALTO - PAD.bottom + 18}
                      textAnchor="middle"
                      fontSize="11"
                      fill={esHover ? '#2a2520' : '#6a625a'}
                      fontWeight={esHover ? '600' : '400'}
                      fontFamily="Outfit, sans-serif"
                      style={{ transition: 'all 0.2s' }}
                    >
                      {d.mes}
                    </text>
                  </g>
                );
              })}

              {/* Línea acumulada */}
              <path
                d={pathAcumulado}
                fill="none"
                stroke="#3d5b3c"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Puntos en la línea */}
              {datos.map((d, i) => (
                <circle
                  key={i}
                  cx={escalaX(i)}
                  cy={escalaYAcum(d.acumulado)}
                  r={mesHover === i ? 6 : 4}
                  fill="#3d5b3c"
                  stroke="#fdfbf6"
                  strokeWidth="2"
                  style={{ transition: 'r 0.2s' }}
                />
              ))}

              {/* Tooltip al hacer hover */}
              {mesHover !== null && datos[mesHover] && (
                <g>
                  <rect
                    x={escalaX(mesHover) - 75}
                    y={PAD.top - 12}
                    width="150"
                    height="58"
                    rx="8"
                    fill="#2a2520"
                    fillOpacity="0.95"
                  />
                  <text
                    x={escalaX(mesHover)}
                    y={PAD.top + 6}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#c6d7c0"
                    fontFamily="Outfit, sans-serif"
                    fontWeight="500"
                  >
                    {datos[mesHover].mes} {anio}
                  </text>
                  <text
                    x={escalaX(mesHover)}
                    y={PAD.top + 22}
                    textAnchor="middle"
                    fontSize="13"
                    fill="#f5efe6"
                    fontFamily="Fraunces, serif"
                    fontWeight="600"
                  >
                    {formatearPrecio(datos[mesHover].ingreso)}
                  </text>
                  <text
                    x={escalaX(mesHover)}
                    y={PAD.top + 38}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#9fbb98"
                    fontFamily="Outfit, sans-serif"
                  >
                    Acumulado: {formatearPrecio(datos[mesHover].acumulado)}
                  </text>
                </g>
              )}
            </svg>

            {/* Leyenda */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-xs text-piedra-700">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-terracota-500" />
                <span>Ingreso del mes</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="20" height="10" aria-hidden="true">
                  <line x1="0" y1="5" x2="20" y2="5" stroke="#3d5b3c" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="10" cy="5" r="3" fill="#3d5b3c" />
                </svg>
                <span>Acumulado año</span>
              </div>
              <div className="text-piedra-600 italic">💡 Pasá el mouse por cada mes para ver el detalle</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- Mini KPI dentro del modal ---
function MiniKpi({ icono: Icono, titulo, valor, sub, color }) {
  const clases = {
    amber: 'bg-amber-100 text-amber-800',
    musgo: 'bg-musgo-100 text-musgo-800',
    piedra: 'bg-piedra-700/10 text-piedra-700',
    terracota: 'bg-terracota-100 text-terracota-800',
  };
  return (
    <div className="bg-crema-100 rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${clases[color]}`}>
        <Icono size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-piedra-600">{titulo}</div>
        <div className="font-display text-lg text-piedra-900 truncate">{valor}</div>
        {sub && <div className="text-xs text-piedra-600">{sub}</div>}
      </div>
    </div>
  );
}
