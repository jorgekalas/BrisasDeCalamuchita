import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendario from '../componentes/Calendario';
import { useAuth } from '../contexto/ContextoAuth';
import { useApi } from '../ganchos/useApi';
import * as apiDisponibilidad from '../api/disponibilidad';
import * as apiPropiedad from '../api/propiedad';
import { enriquecerPropiedad, propiedadDefault } from '../datos/propiedadConDefaults';
import { expandirRangosAFechas } from '../datos/adaptadorDisponibilidad';
import { formatearFecha, calcularNoches, formatearPrecio } from '../utilidades/formato';
import { Calendar, Users, ArrowRight, AlertCircle } from 'lucide-react';

/**
 * Página pública de consulta de disponibilidad.
 * Trae del backend:
 *  - GET /api/propiedad        → datos de la propiedad (precio, capacidad)
 *  - GET /api/reservas/disponibilidad → fechas ocupadas (estado != cancelada/finalizada)
 *
 * Permite al visitante explorar el calendario y, si lo desea,
 * arrancar el proceso de reserva (redirige a login si no está autenticado).
 */
export default function Disponibilidad() {
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const [seleccion, setSeleccion] = useState({ desde: null, hasta: null });

  // --- Cargar propiedad (para precio y capacidad en el sidebar) ---
  const { datos: dataPropiedad } = useApi(
    () => apiPropiedad.listarPropiedades(),
    []
  );
  const propiedad = dataPropiedad && dataPropiedad[0]
    ? enriquecerPropiedad(dataPropiedad[0])
    : propiedadDefault;

  // --- Cargar disponibilidad (rangos ocupados) ---
  const {
    datos: rangosOcupados,
    cargando: cargandoDisp,
    error: errorDisp,
  } = useApi(() => apiDisponibilidad.obtenerDisponibilidad(), []);

  // Expandir los rangos del backend a fechas individuales que el
  // componente del calendario sabe pintar
  const fechasOcupadas = rangosOcupados
    ? expandirRangosAFechas(rangosOcupados)
    : [];

  const noches = calcularNoches(seleccion.desde, seleccion.hasta);
  const total = noches * propiedad.precioPorNoche;

  const handleReservar = () => {
    if (!seleccion.desde || !seleccion.hasta) return;
    // Guardamos en sessionStorage para no perderlo si va a login
    sessionStorage.setItem('fechasReserva', JSON.stringify(seleccion));
    if (!estaAutenticado) navigate('/ingresar?volver=/reservar');
    else navigate('/reservar');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Encabezado */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-terracota-600 mb-3">Disponibilidad en vivo</div>
        <h1 className="font-display text-4xl md:text-5xl text-piedra-900 mb-4">
          Elegí tus <span className="italic text-musgo-700">fechas</span>
        </h1>
        <p className="text-piedra-700 leading-relaxed">
          Tocá un día para marcar el ingreso y otro para el egreso. Las fechas tachadas
          ya están reservadas; las amarillas, en proceso de confirmación.
        </p>
      </div>

      {/* Error al cargar disponibilidad */}
      {errorDisp && (
        <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <strong>No pudimos cargar la disponibilidad.</strong>
            <p className="mt-1">{errorDisp.mensaje}. El calendario se muestra sin fechas ocupadas.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendario */}
        <div className="lg:col-span-2">
          {cargandoDisp ? (
            <div className="tarjeta text-center py-20 text-piedra-700 text-sm">
              Cargando calendario...
            </div>
          ) : (
            <Calendario
              modo="seleccionar"
              fechasOcupadas={fechasOcupadas}
              onSeleccionRango={setSeleccion}
            />
          )}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="tarjeta sticky top-24">
            <h3 className="font-display text-2xl text-musgo-800 mb-4">Tu selección</h3>

            {!seleccion.desde && (
              <div className="text-sm text-piedra-700 leading-relaxed">
                Tocá un día para empezar. La selección queda lista en segundos.
              </div>
            )}

            {seleccion.desde && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-crema-100">
                  <Calendar size={18} className="text-musgo-700" />
                  <div>
                    <div className="text-xs text-piedra-600 uppercase tracking-widest">Ingreso</div>
                    <div className="font-medium text-piedra-900">{formatearFecha(seleccion.desde)}</div>
                  </div>
                </div>

                {seleccion.hasta ? (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-crema-100">
                      <Calendar size={18} className="text-musgo-700" />
                      <div>
                        <div className="text-xs text-piedra-600 uppercase tracking-widest">Egreso</div>
                        <div className="font-medium text-piedra-900">{formatearFecha(seleccion.hasta)}</div>
                      </div>
                    </div>

                    <div className="border-t border-crema-200 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-piedra-700">{noches} noche{noches !== 1 ? 's' : ''} × {formatearPrecio(propiedad.precioPorNoche)}</span>
                        <span className="font-medium">{formatearPrecio(total)}</span>
                      </div>
                      <div className="flex justify-between font-display text-lg pt-2 border-t border-crema-200">
                        <span>Total estimado</span>
                        <span className="text-musgo-800">{formatearPrecio(total)}</span>
                      </div>
                    </div>

                    <button onClick={handleReservar} className="btn-principal w-full">
                      Solicitar reserva <ArrowRight size={18} />
                    </button>

                    <div className="text-xs text-piedra-600 text-center leading-relaxed">
                      Las fechas quedan bloqueadas por <strong>2 horas</strong> mientras
                      el administrador revisa tu solicitud.
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-piedra-700 italic">
                    Ahora elegí el día de egreso →
                  </div>
                )}
              </div>
            )}

            {/* Capacidad */}
            <div className="mt-6 pt-6 border-t border-crema-200 flex items-center gap-2 text-sm text-piedra-700">
              <Users size={16} className="text-musgo-700" />
              <span>Capacidad: {propiedad.capacidadMinima} a {propiedad.capacidadMaxima} personas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
