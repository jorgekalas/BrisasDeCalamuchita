import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useApi } from '../ganchos/useApi';
import * as apiReservas from '../api/reservas';
import { extraerError } from '../api/cliente';
import { ESTADOS, ESTILOS_ESTADO } from '../datos/constantes';
import { formatearFecha, formatearFechaConAnio, calcularNoches } from '../utilidades/formato';
import { Calendar, Users, Car, Phone, X, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Listado de reservas del cliente logueado.
 * Conectado a GET /api/mis-reservas. Permite cancelar reservas
 * propias en estado Pendiente o Confirmada (el backend valida
 * la regla de 24hs antes del ingreso).
 */
export default function MisReservas() {
  const {
    datos: respuesta,
    cargando,
    error,
    recargar,
  } = useApi(() => apiReservas.listarMisReservas({ porPagina: 50 }), []);

  const [cancelando, setCancelando] = useState(null);  // id de la reserva que se está cancelando
  const [errorCancelar, setErrorCancelar] = useState(null);

  const reservas = respuesta?.reservas || [];

  const handleCancelar = async (reservaId) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;

    setCancelando(reservaId);
    setErrorCancelar(null);

    try {
      await apiReservas.cancelarReserva(reservaId);
      // Refrescar el listado para ver el cambio de estado
      recargar();
    } catch (err) {
      const e = extraerError(err);
      setErrorCancelar({ id: reservaId, mensaje: e.mensaje });
    } finally {
      setCancelando(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-terracota-600 mb-3">Tu historial</div>
          <h1 className="font-display text-4xl md:text-5xl text-piedra-900">
            Mis <span className="italic text-musgo-700">reservas</span>
          </h1>
        </div>
        <button
          onClick={recargar}
          className="text-piedra-700 hover:text-musgo-700 p-2 rounded-full hover:bg-crema-200/60 transition-colors"
          aria-label="Actualizar"
          title="Actualizar listado"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Loading */}
      {cargando && (
        <div className="tarjeta text-center py-16 text-sm text-piedra-700">
          Cargando tus reservas...
        </div>
      )}

      {/* Error general */}
      {error && (
        <div className="tarjeta border-red-200 bg-red-50 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-red-900 mb-1">No pudimos cargar tus reservas</div>
              <div className="text-sm text-red-700">{error.mensaje}</div>
            </div>
          </div>
        </div>
      )}

      {/* Sin reservas */}
      {!cargando && !error && reservas.length === 0 && (
        <div className="tarjeta text-center py-16">
          <p className="text-piedra-700 mb-6">Todavía no tenés reservas.</p>
          <Link to="/disponibilidad" className="btn-principal">Ver disponibilidad</Link>
        </div>
      )}

      {/* Listado */}
      {!cargando && reservas.length > 0 && (
        <div className="space-y-4 escalonar">
          {reservas.map((r) => {
            const cancelable = r.estado === ESTADOS.PENDIENTE || r.estado === ESTADOS.CONFIRMADA;
            return (
              <div key={r.id} className="tarjeta hover:shadow-calido transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-xs font-mono text-piedra-600 mb-1">Reserva #{r.id}</div>
                    <div className="font-display text-xl text-piedra-900">
                      {formatearFecha(r.fecha_ingreso)} → {formatearFechaConAnio(r.fecha_egreso)}
                    </div>
                    <div className="text-xs text-piedra-600">
                      {calcularNoches(r.fecha_ingreso, r.fecha_egreso)} noches
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${ESTILOS_ESTADO[r.estado] || ''}`}>
                    {r.estado}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-piedra-700">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-musgo-700" /> {r.cantidad_huespedes} huéspedes
                  </div>
                  {r.vehiculo?.patente && (
                    <div className="flex items-center gap-2">
                      <Car size={14} className="text-musgo-700" /> {r.vehiculo.modelo} · {r.vehiculo.patente}
                    </div>
                  )}
                  {r.pago && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-musgo-700" />
                      Pago: <strong>{r.pago.estado_pago}</strong>
                    </div>
                  )}
                </div>

                {r.observaciones && (
                  <div className="mt-3 pt-3 border-t border-crema-200 text-xs text-piedra-700 italic">
                    {r.observaciones}
                  </div>
                )}

                {/* Error al cancelar */}
                {errorCancelar?.id === r.id && (
                  <div className="mt-3 pt-3 border-t border-crema-200 text-xs text-red-700 bg-red-50 p-2 rounded-lg flex items-start gap-2">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    <span>{errorCancelar.mensaje}</span>
                  </div>
                )}

                {/* Botón cancelar (solo si aplica) */}
                {cancelable && (
                  <div className="mt-4 pt-4 border-t border-crema-200 flex justify-end">
                    <button
                      onClick={() => handleCancelar(r.id)}
                      disabled={cancelando === r.id}
                      className="text-sm text-red-700 hover:text-red-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <X size={14} />
                      {cancelando === r.id ? 'Cancelando...' : 'Cancelar reserva'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
