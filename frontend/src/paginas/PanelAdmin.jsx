import { useState, useMemo } from 'react';
import { useApi } from '../ganchos/useApi';
import * as apiReservas from '../api/reservas';
import * as apiDisponibilidad from '../api/disponibilidad';
import { extraerError } from '../api/cliente';
import { ESTADOS, ESTILOS_ESTADO } from '../datos/constantes';
import { expandirRangosAFechas } from '../datos/adaptadorDisponibilidad';
import {
  formatearRangoFechas,
  calcularNoches,
  formatearPrecio,
  armarLinkWhatsApp,
} from '../utilidades/formato';
import Calendario from '../componentes/Calendario';
import {
  Check, X, Calendar, Users, Car, Phone, Mail, LogIn, LogOut,
  AlertCircle, RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react';

const FILTROS = ['Todas', 'Pendiente', 'Confirmada', 'En curso', 'Finalizada', 'Cancelada'];
const RESERVAS_POR_PAGINA = 10;


// =============================================================
//   PANEL DE ADMINISTRACION
// =============================================================
//   Conectado a:
//     - GET /api/reservas (paginado, con filtro por estado)
//     - POST /api/reservas/:id/confirmar
//     - POST /api/reservas/:id/cancelar
//     - POST /api/reservas/:id/check-in
//     - POST /api/reservas/:id/check-out
//     - GET /api/reservas/disponibilidad (calendario lateral)
// =============================================================

export default function PanelAdmin() {
  const [filtro, setFiltro] = useState('Todas');
  const [pagina, setPagina] = useState(1);
  const [accionEnCurso, setAccionEnCurso] = useState(null);  // { reservaId, accion }
  const [errorAccion, setErrorAccion] = useState(null);

  // --- Listado de reservas paginado del servidor ---
  // useApi se re-ejecuta cuando cambian filtro o pagina (deps)
  const {
    datos: respuesta,
    cargando,
    error,
    recargar,
  } = useApi(
    () => apiReservas.listarReservas({
      pagina,
      porPagina: RESERVAS_POR_PAGINA,
      estado: filtro === 'Todas' ? undefined : filtro,
    }),
    [filtro, pagina]
  );

  const reservas = respuesta?.reservas || [];
  const meta = respuesta?.metadata?.paginacion;

  // --- Disponibilidad para el calendario lateral ---
  const { datos: rangosOcupados } = useApi(
    () => apiDisponibilidad.obtenerDisponibilidad(),
    []
  );
  const fechasOcupadas = rangosOcupados
    ? expandirRangosAFechas(rangosOcupados)
    : [];

  // --- KPIs derivados de las reservas visibles ---
  //   Nota: son KPIs de la pagina actual + filtro actual, NO totales globales.
  //   Para totales globales habria que crear un endpoint /api/reservas/stats.
  const stats = useMemo(() => {
    return {
      total: meta?.total || 0,
      pendientes: reservas.filter((r) => r.estado === ESTADOS.PENDIENTE).length,
      confirmadas: reservas.filter((r) => r.estado === ESTADOS.CONFIRMADA).length,
      enCurso: reservas.filter((r) => r.estado === ESTADOS.EN_CURSO).length,
    };
  }, [reservas, meta]);

  // Cambio de filtro: resetear a pagina 1
  const cambiarFiltro = (f) => {
    setFiltro(f);
    setPagina(1);
    setErrorAccion(null);
  };

  // --- Manejador genérico de acciones de máquina de estados ---
  const ejecutarAccion = async (reservaId, accion, fnApi) => {
    const labels = {
      confirmar: 'Confirmar esta reserva',
      cancelar: 'Cancelar esta reserva',
      checkIn: 'Marcar check-in (la huésped llegó)',
      checkOut: 'Marcar check-out (huésped se fue)',
    };
    if (!confirm(`${labels[accion]}?`)) return;

    setAccionEnCurso({ reservaId, accion });
    setErrorAccion(null);

    try {
      await fnApi(reservaId);
      recargar();
    } catch (err) {
      const e = extraerError(err);
      setErrorAccion({ reservaId, mensaje: e.mensaje });
    } finally {
      setAccionEnCurso(null);
    }
  };

  const handleConfirmar = (id) => ejecutarAccion(id, 'confirmar', apiReservas.confirmarReserva);
  const handleCancelar = (id) => ejecutarAccion(id, 'cancelar', apiReservas.cancelarReserva);
  const handleCheckIn  = (id) => ejecutarAccion(id, 'checkIn', apiReservas.checkInReserva);
  const handleCheckOut = (id) => ejecutarAccion(id, 'checkOut', apiReservas.checkOutReserva);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-terracota-600 mb-3">Panel interno</div>
          <h1 className="font-display text-4xl md:text-5xl text-piedra-900">
            Gestión de <span className="italic text-musgo-700">reservas</span>
          </h1>
        </div>
        <button
          onClick={recargar}
          className="text-piedra-700 hover:text-musgo-700 p-2 rounded-full hover:bg-crema-200/60 transition-colors"
          aria-label="Actualizar"
          title="Actualizar"
          disabled={cargando}
        >
          <RefreshCw size={18} className={cargando ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* KPIs basicos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KpiCard
          icono={Calendar}
          valor={stats.total}
          titulo={filtro === 'Todas' ? 'Reservas totales' : `Filtro: ${filtro}`}
          color="terracota"
        />
        <KpiCard icono={AlertCircle} valor={stats.pendientes} titulo="Pendientes en página" color="amber" />
        <KpiCard icono={Check} valor={stats.confirmadas} titulo="Confirmadas en página" color="musgo" />
        <KpiCard icono={LogIn} valor={stats.enCurso} titulo="En curso en página" color="piedra" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Lista de reservas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filtros */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {FILTROS.map((f) => (
                <button
                  key={f}
                  onClick={() => cambiarFiltro(f)}
                  className={`px-4 py-1.5 rounded-capsula text-xs font-medium transition-colors ${
                    filtro === f
                      ? 'bg-musgo-700 text-crema-50'
                      : 'bg-crema-200 text-piedra-700 hover:bg-crema-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="text-xs text-piedra-600">
              {meta?.total ?? 0} {(meta?.total === 1) ? 'reserva' : 'reservas'} en total
            </div>
          </div>

          {/* Estado de carga */}
          {cargando && (
            <div className="tarjeta text-center py-12 text-sm text-piedra-700">
              Cargando reservas...
            </div>
          )}

          {/* Error de carga */}
          {error && (
            <div className="tarjeta border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-red-900 mb-1">No pudimos cargar las reservas</div>
                  <div className="text-sm text-red-700">{error.mensaje}</div>
                </div>
              </div>
            </div>
          )}

          {/* Listado */}
          {!cargando && !error && (
            <>
              <div className="space-y-3">
                {reservas.length === 0 ? (
                  <div className="tarjeta text-center py-12 text-piedra-600 text-sm italic">
                    No hay reservas en esta categoría.
                  </div>
                ) : (
                  reservas.map((r) => (
                    <TarjetaReserva
                      key={r.id}
                      reserva={r}
                      accionEnCurso={accionEnCurso}
                      errorAccion={errorAccion}
                      onConfirmar={handleConfirmar}
                      onCancelar={handleCancelar}
                      onCheckIn={handleCheckIn}
                      onCheckOut={handleCheckOut}
                    />
                  ))
                )}
              </div>

              {/* Paginacion */}
              {meta && meta.totalPaginas > 1 && (
                <Paginacion
                  pagina={meta.pagina}
                  total={meta.totalPaginas}
                  onCambiar={setPagina}
                  totalReservas={meta.total}
                />
              )}
            </>
          )}
        </div>

        {/* Panel lateral: calendario */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h3 className="font-display text-lg text-piedra-900 mb-3">Calendario general</h3>
            <Calendario modo="visualizar" fechasOcupadas={fechasOcupadas} />
          </div>

          <div className="tarjeta bg-musgo-50/60 border-musgo-200">
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-musgo-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-musgo-800 leading-relaxed">
                <div className="font-medium mb-1">Notificaciones automáticas</div>
                Las notificaciones por email se generan automáticamente cuando
                cambia el estado de una reserva. Pueden verse en phpMyAdmin →
                tabla <code className="bg-musgo-100 px-1 rounded">notificacion</code>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// =============================================================
//   COMPONENTES INTERNOS
// =============================================================


function TarjetaReserva({
  reserva: r,
  accionEnCurso,
  errorAccion,
  onConfirmar, onCancelar, onCheckIn, onCheckOut,
}) {
  // Helper: chequear si esta reserva tiene una accion en curso
  const procesando = accionEnCurso?.reservaId === r.id;
  const errorDeEsta = errorAccion?.reservaId === r.id;

  // Telefono del cliente (la observacion puede tener telefono incrustado)
  const telefono = r.cliente?.telefono;

  return (
    <div className="tarjeta hover:shadow-calido transition-shadow">
      {/* Encabezado: cliente + estado */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-xs font-mono text-piedra-600">Reserva #{r.id}</div>
          <div className="font-display text-lg text-piedra-900">
            {r.cliente?.nombre} {r.cliente?.apellido}
          </div>
          <div className="text-xs text-piedra-600">{r.cliente?.email}</div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${ESTILOS_ESTADO[r.estado] || ''}`}>
          {r.estado}
        </span>
      </div>

      {/* Fechas y datos basicos */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-piedra-700">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-musgo-700" />
          {formatearRangoFechas(r.fecha_ingreso, r.fecha_egreso)}
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-musgo-700" /> {r.cantidad_huespedes}
        </div>
        {r.vehiculo?.patente && (
          <div className="flex items-center gap-1.5">
            <Car size={14} className="text-musgo-700" /> {r.vehiculo.patente}
          </div>
        )}
      </div>

      {/* Observaciones */}
      {r.observaciones && (
        <div className="mt-3 text-xs text-piedra-700 italic bg-crema-50 p-2 rounded-lg whitespace-pre-line">
          {r.observaciones}
        </div>
      )}

      {/* Boton WhatsApp para contactar al cliente */}
      {telefono && (
        <div className="mt-4 flex items-center justify-between gap-3 px-4 py-3 bg-musgo-100/60 rounded-2xl">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-musgo-700 font-medium">
              Contacto del cliente
            </div>
            <div className="font-display text-base text-piedra-900 flex items-center gap-2 truncate">
              <Phone size={14} className="text-musgo-700 flex-shrink-0" />
              {telefono}
            </div>
          </div>
          <a
            href={armarLinkWhatsApp(
              telefono,
              `Hola ${r.cliente?.nombre}, te escribo desde Brisas de Calamuchita por tu reserva #${r.id}.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-capsula bg-[#25D366] text-white text-sm font-medium hover:bg-[#1ebe5a] transition-colors flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      )}

      {/* Error de la accion */}
      {errorDeEsta && (
        <div className="mt-3 text-xs text-red-700 bg-red-50 p-2 rounded-lg flex items-start gap-2">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{errorAccion.mensaje}</span>
        </div>
      )}

      {/* Acciones de la maquina de estados */}
      <div className="mt-4 pt-4 border-t border-crema-200 flex flex-wrap gap-2">
        {r.estado === ESTADOS.PENDIENTE && (
          <>
            <button
              onClick={() => onConfirmar(r.id)}
              disabled={procesando}
              className="btn-secundario !py-2 !px-4 text-sm flex-1 disabled:opacity-50"
            >
              <Check size={16} />
              {procesando && accionEnCurso?.accion === 'confirmar' ? 'Confirmando...' : 'Confirmar'}
            </button>
            <button
              onClick={() => onCancelar(r.id)}
              disabled={procesando}
              className="btn-fantasma !py-2 !px-4 text-sm !border-red-300 !text-red-700 hover:!bg-red-700 hover:!text-crema-50 disabled:opacity-50"
            >
              <X size={16} /> Rechazar
            </button>
          </>
        )}

        {r.estado === ESTADOS.CONFIRMADA && (
          <>
            <button
              onClick={() => onCheckIn(r.id)}
              disabled={procesando}
              className="btn-secundario !py-2 !px-4 text-sm flex-1 disabled:opacity-50"
            >
              <LogIn size={16} />
              {procesando && accionEnCurso?.accion === 'checkIn' ? 'Marcando...' : 'Check-in'}
            </button>
            <button
              onClick={() => onCancelar(r.id)}
              disabled={procesando}
              className="btn-fantasma !py-2 !px-4 text-sm !border-red-300 !text-red-700 hover:!bg-red-700 hover:!text-crema-50 disabled:opacity-50"
            >
              <X size={16} /> Cancelar
            </button>
          </>
        )}

        {r.estado === ESTADOS.EN_CURSO && (
          <button
            onClick={() => onCheckOut(r.id)}
            disabled={procesando}
            className="btn-secundario !py-2 !px-4 text-sm flex-1 disabled:opacity-50"
          >
            <LogOut size={16} />
            {procesando && accionEnCurso?.accion === 'checkOut' ? 'Marcando...' : 'Check-out'}
          </button>
        )}

        {[ESTADOS.FINALIZADA, ESTADOS.CANCELADA, ESTADOS.NO_SHOW].includes(r.estado) && (
          <div className="text-xs text-piedra-600 italic">
            Esta reserva está cerrada. No hay acciones disponibles.
          </div>
        )}
      </div>
    </div>
  );
}


function KpiCard({ icono: Icono, valor, titulo, color }) {
  const clases = {
    amber: 'bg-amber-100 text-amber-800',
    musgo: 'bg-musgo-100 text-musgo-800',
    piedra: 'bg-piedra-700/10 text-piedra-700',
    terracota: 'bg-terracota-100 text-terracota-800',
  };

  return (
    <div className="tarjeta">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${clases[color]}`}>
        <Icono size={20} />
      </div>
      <div className="font-display text-2xl text-piedra-900">{valor}</div>
      <div className="text-xs text-piedra-600 uppercase tracking-widest mt-1">{titulo}</div>
    </div>
  );
}


function Paginacion({ pagina, total, onCambiar, totalReservas }) {
  // Mostramos siempre la primera y la última. Alrededor de la actual hasta 1 a cada lado.
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
    <nav className="flex flex-wrap items-center justify-between gap-4 pt-2">
      <div className="text-xs text-piedra-600">
        Página <strong className="text-piedra-900">{pagina}</strong> de{' '}
        <strong className="text-piedra-900">{total}</strong>
        {' · '}
        <strong className="text-piedra-900">{totalReservas}</strong> reservas en total
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
