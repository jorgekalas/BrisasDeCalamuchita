import { useState, useMemo } from 'react';
import { useApp } from '../ContextoApp';
import { ESTADOS, estadoEfectivo } from '../datos/mock';
import { formatearFecha, formatearRangoFechas, calcularNoches, formatearPrecio, armarLinkWhatsApp } from '../utilidades/formato';
import Calendario from '../componentes/Calendario';
import ModalIngresos from '../componentes/ModalIngresos';
import { Check, X, Calendar, Users, Car, Phone, Mail, TrendingUp, Clock, CheckCircle2, AlertCircle, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

const FILTROS = ['Todas', 'Pendiente', 'Confirmada', 'En curso', 'Finalizada', 'Cancelada'];
const BADGE = {
  'Pendiente': 'badge-pendiente',
  'Confirmada': 'badge-confirmada',
  'En curso': 'badge-en-curso',
  'Finalizada': 'badge-finalizada',
  'Cancelada': 'badge-cancelada',
};

const RESERVAS_POR_PAGINA = 10;

export default function PanelAdmin() {
  const { reservas, cambiarEstadoReserva, notificaciones } = useApp();
  const [filtro, setFiltro] = useState('Todas');
  const [reservaActiva, setReservaActiva] = useState(null);
  const [verGraficoIngresos, setVerGraficoIngresos] = useState(false);
  const [pagina, setPagina] = useState(1);

  // Enriquecemos las reservas con su "estado efectivo" calculado según la fecha actual.
  // Esto evita inconsistencias cuando el mock tiene fechas fijas pero el tiempo avanza.
  const reservasConEstado = useMemo(
    () => reservas.map((r) => ({ ...r, estado: estadoEfectivo(r) })),
    [reservas]
  );

  // --- KPIs ---
  const stats = useMemo(() => {
    const pendientes = reservasConEstado.filter((r) => r.estado === ESTADOS.PENDIENTE).length;
    const confirmadas = reservasConEstado.filter((r) => r.estado === ESTADOS.CONFIRMADA).length;
    const enCurso = reservasConEstado.filter((r) => r.estado === ESTADOS.EN_CURSO);
    const finalizadas = reservasConEstado.filter((r) => r.estado === ESTADOS.FINALIZADA);

    // Ingreso histórico 2026 (solo finalizadas del año actual)
    const anioActual = new Date().getFullYear();
    const finalizadasDelAnio = finalizadas.filter(
      (r) => new Date(r.fechaIngreso).getFullYear() === anioActual
    );
    const ingresoAnio = finalizadasDelAnio.reduce(
      (acc, r) => acc + calcularNoches(r.fechaIngreso, r.fechaEgreso) * 85000,
      0
    );

    return {
      pendientes,
      confirmadas: confirmadas + enCurso.length,
      finalizadas: finalizadas.length,
      ingresoAnio,
      anioActual,
    };
  }, [reservasConEstado]);

  // --- Datos para el gráfico mensual (mes a mes del año actual) ---
  const datosGraficoMensual = useMemo(() => {
    const anioActual = new Date().getFullYear();
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
    ];
    const ingresosMensuales = Array(12).fill(0);

    reservasConEstado
      .filter((r) => r.estado === ESTADOS.FINALIZADA)
      .filter((r) => new Date(r.fechaIngreso).getFullYear() === anioActual)
      .forEach((r) => {
        const mes = new Date(r.fechaIngreso + 'T12:00:00').getMonth();
        ingresosMensuales[mes] += calcularNoches(r.fechaIngreso, r.fechaEgreso) * 85000;
      });

    // Acumulado para la línea de tendencia
    let acumulado = 0;
    const acumulados = ingresosMensuales.map((v) => (acumulado += v));

    return meses.map((nombre, i) => ({
      mes: nombre,
      ingreso: ingresosMensuales[i],
      acumulado: acumulados[i],
    }));
  }, [reservasConEstado]);

  // Filtramos por estado y ordenamos por fecha de creación (más recientes primero).
  // En el backend real esto se hará en SQL; acá lo hacemos en memoria.
  const filtradas = useMemo(() => {
    const base = filtro === 'Todas'
      ? reservasConEstado
      : reservasConEstado.filter((r) => r.estado === filtro);
    return [...base].sort((a, b) => (a.creadaEn < b.creadaEn ? 1 : -1));
  }, [reservasConEstado, filtro]);

  // Cantidad de páginas y reservas visibles en la página actual.
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / RESERVAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const desde = (paginaActual - 1) * RESERVAS_POR_PAGINA;
  const reservasVisibles = filtradas.slice(desde, desde + RESERVAS_POR_PAGINA);

  // Al cambiar de filtro volvemos a la página 1.
  const cambiarFiltro = (f) => {
    setFiltro(f);
    setPagina(1);
  };

  const handleConfirmar = (id) => cambiarEstadoReserva(id, ESTADOS.CONFIRMADA);
  const handleCancelar = (id) => cambiarEstadoReserva(id, ESTADOS.CANCELADA);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest text-terracota-600 mb-3">Panel interno</div>
        <h1 className="font-display text-4xl md:text-5xl text-piedra-900">
          Gestión de <span className="italic text-musgo-700">reservas</span>
        </h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 escalonar">
        <KpiCard icono={AlertCircle} valor={stats.pendientes} titulo="Pendientes" color="amber" />
        <KpiCard icono={CheckCircle2} valor={stats.confirmadas} titulo="Confirmadas" color="musgo" />
        <KpiCard icono={Clock} valor={stats.finalizadas} titulo="Finalizadas" color="piedra" />
        <KpiCard
          icono={TrendingUp}
          valor={formatearPrecio(stats.ingresoAnio)}
          titulo={`Ingreso histórico ${stats.anioActual}`}
          color="terracota"
          clickeable
          onClick={() => setVerGraficoIngresos(true)}
          extra={<span className="text-[10px] text-terracota-700 inline-flex items-center gap-1 mt-1"><BarChart3 size={11} /> ver evolución mensual →</span>}
        />
      </div>

      {/* Modal del gráfico de ingresos */}
      {verGraficoIngresos && (
        <ModalIngresos
          datos={datosGraficoMensual}
          anio={stats.anioActual}
          total={stats.ingresoAnio}
          onCerrar={() => setVerGraficoIngresos(false)}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Lista */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filtros */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {FILTROS.map((f) => (
                <button
                  key={f}
                  onClick={() => cambiarFiltro(f)}
                  className={`px-4 py-1.5 rounded-capsula text-xs font-medium transition-colors ${
                    filtro === f ? 'bg-musgo-700 text-crema-50' : 'bg-crema-200 text-piedra-700 hover:bg-crema-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="text-xs text-piedra-600">
              {filtradas.length === 0
                ? 'Sin resultados'
                : `${filtradas.length} ${filtradas.length === 1 ? 'reserva' : 'reservas'}`}
            </div>
          </div>

          {/* Tarjetas */}
          <div className="space-y-3 escalonar">
            {reservasVisibles.length === 0 ? (
              <div className="tarjeta text-center py-12 text-piedra-600 text-sm italic">
                No hay reservas en esta categoría.
              </div>
            ) : reservasVisibles.map((r) => (
              <div
                key={r.id}
                onClick={() => setReservaActiva(r)}
                className={`tarjeta cursor-pointer transition-all ${reservaActiva?.id === r.id ? 'ring-2 ring-musgo-500 shadow-calido' : 'hover:shadow-calido'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="text-xs font-mono text-piedra-600">{r.id}</div>
                    <div className="font-display text-lg text-piedra-900">{r.nombreCliente}</div>
                    <div className="text-xs text-piedra-600">{r.emailCliente}</div>
                  </div>
                  <span className={`badge ${BADGE[r.estado]}`}>{r.estado}</span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-piedra-700">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-musgo-700" />
                    {formatearRangoFechas(r.fechaIngreso, r.fechaEgreso)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-musgo-700" /> {r.cantidadHuespedes}
                  </div>
                  {r.vehiculo?.patente && (
                    <div className="flex items-center gap-1.5">
                      <Car size={14} className="text-musgo-700" /> {r.vehiculo.patente}
                    </div>
                  )}
                </div>

                {/* Teléfono destacado para coordinar la seña */}
                {r.telefonoCliente && (
                  <div className="mt-4 flex items-center justify-between gap-3 px-4 py-3 bg-musgo-100/60 rounded-2xl">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-widest text-musgo-700 font-medium">
                        Para coordinar pago
                      </div>
                      <div className="font-display text-base text-piedra-900 flex items-center gap-2 truncate">
                        <Phone size={14} className="text-musgo-700 flex-shrink-0" />
                        {r.telefonoCliente}
                      </div>
                    </div>
                    <a
                      href={armarLinkWhatsApp(
                        r.telefonoCliente,
                        `Hola ${r.nombreCliente}, te escribo desde Brisas de Calamuchita por tu reserva ${r.id} ` +
                        `(${formatearFecha(r.fechaIngreso)} al ${formatearFecha(r.fechaEgreso)}). ` +
                        `Te paso los datos para coordinar la seña.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-capsula bg-[#25D366] text-white text-sm font-medium hover:bg-[#1ebe5a] transition-colors flex-shrink-0"
                      aria-label={`Contactar a ${r.nombreCliente} por WhatsApp`}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      WhatsApp
                    </a>
                  </div>
                )}

                {r.estado === ESTADOS.PENDIENTE && (
                  <div className="mt-4 pt-4 border-t border-crema-200 flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleConfirmar(r.id); }}
                      className="btn-secundario !py-2 !px-4 text-sm flex-1"
                    >
                      <Check size={16} /> Confirmar
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCancelar(r.id); }}
                      className="btn-fantasma !py-2 !px-4 text-sm !border-red-300 !text-red-700 hover:!bg-red-700 hover:!text-crema-50"
                    >
                      <X size={16} /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <Paginacion
              pagina={paginaActual}
              total={totalPaginas}
              onCambiar={setPagina}
              desde={desde + 1}
              hasta={Math.min(desde + RESERVAS_POR_PAGINA, filtradas.length)}
              totalReservas={filtradas.length}
            />
          )}
        </div>

        {/* Panel lateral: calendario + notificaciones */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h3 className="font-display text-lg text-piedra-900 mb-3">Vista general</h3>
            <Calendario modo="visualizar" />
          </div>

          <div>
            <h3 className="font-display text-lg text-piedra-900 mb-3 flex items-center gap-2">
              <Mail size={18} className="text-musgo-700" /> Últimas notificaciones
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notificaciones.length === 0 && (
                <div className="text-xs text-piedra-600 italic">Sin notificaciones todavía</div>
              )}
              {notificaciones.slice(0, 6).map((n) => (
                <div key={n.id} className="text-xs bg-crema-50 rounded-2xl p-3 border border-crema-200">
                  <div className="font-medium text-piedra-900 mb-0.5">{n.asunto}</div>
                  <div className="text-piedra-600 truncate">→ {n.para}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Tarjeta de KPI ---
function KpiCard({ icono: Icono, valor, titulo, color, clickeable = false, onClick, extra }) {
  const clases = {
    amber: 'bg-amber-100 text-amber-800',
    musgo: 'bg-musgo-100 text-musgo-800',
    piedra: 'bg-piedra-700/10 text-piedra-700',
    terracota: 'bg-terracota-100 text-terracota-800',
  };

  const claseInteractiva = clickeable
    ? 'cursor-pointer hover:shadow-calido hover:-translate-y-1 transition-all duration-300 hover:ring-2 hover:ring-terracota-200'
    : '';

  const contenido = (
    <>
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${clases[color]}`}>
        <Icono size={20} />
      </div>
      <div className="font-display text-2xl text-piedra-900">{valor}</div>
      <div className="text-xs text-piedra-600 uppercase tracking-widest mt-1">{titulo}</div>
      {extra}
    </>
  );

  if (clickeable) {
    return (
      <button onClick={onClick} className={`tarjeta text-left ${claseInteractiva}`} type="button">
        {contenido}
      </button>
    );
  }
  return <div className="tarjeta">{contenido}</div>;
}

// --- Paginación ---
function Paginacion({ pagina, total, onCambiar, desde, hasta, totalReservas }) {
  // Genera el listado de páginas a mostrar (con elipsis si son muchas).
  // Reglas: siempre mostramos primera y última; alrededor de la actual hasta 2 a cada lado.
  const construirPaginas = () => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pags = [1];
    if (pagina > 3) pags.push('...');
    const inicio = Math.max(2, pagina - 1);
    const fin = Math.min(total - 1, pagina + 1);
    for (let i = inicio; i <= fin; i++) pags.push(i);
    if (pagina < total - 2) pags.push('...');
    pags.push(total);
    return pags;
  };

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 pt-2" aria-label="Paginación de reservas">
      <div className="text-xs text-piedra-600">
        Mostrando <strong className="text-piedra-900">{desde}–{hasta}</strong> de{' '}
        <strong className="text-piedra-900">{totalReservas}</strong>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onCambiar(pagina - 1)}
          disabled={pagina === 1}
          className="p-2 rounded-full hover:bg-crema-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft size={18} className="text-musgo-700" />
        </button>

        {construirPaginas().map((p, i) =>
          p === '...' ? (
            <span key={`gap-${i}`} className="px-2 text-piedra-600">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onCambiar(p)}
              className={`min-w-[36px] h-9 rounded-full text-sm font-medium transition-colors ${
                p === pagina
                  ? 'bg-musgo-700 text-crema-50'
                  : 'text-piedra-700 hover:bg-crema-200'
              }`}
              aria-label={`Ir a la página ${p}`}
              aria-current={p === pagina ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onCambiar(pagina + 1)}
          disabled={pagina === total}
          className="p-2 rounded-full hover:bg-crema-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRight size={18} className="text-musgo-700" />
        </button>
      </div>
    </nav>
  );
}
