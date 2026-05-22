import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexto/ContextoAuth';
import { useApi } from '../ganchos/useApi';
import * as apiPropiedad from '../api/propiedad';
import * as apiReservas from '../api/reservas';
import { enriquecerPropiedad, propiedadDefault } from '../datos/propiedadConDefaults';
import { extraerError } from '../api/cliente';
import { formatearFecha, calcularNoches, formatearPrecio } from '../utilidades/formato';
import { Users, Car, MessageSquare, Phone, ArrowRight, ArrowLeft, Check, AlertCircle } from 'lucide-react';

/**
 * Pagina de creacion de reserva.
 * - Lee las fechas que el usuario eligio en /disponibilidad (via sessionStorage)
 * - Hace POST /api/reservas con los datos del form + vehiculo (si aplica)
 * - Maneja errores de validacion (400), conflicto de fechas (409), capacidad (422)
 *
 * NOTA: El telefono y observaciones que captura el form NO se mandan al
 * backend (la tabla reserva solo guarda observaciones). El telefono se
 * usa para coordinacion humana posterior; se incluye en las observaciones
 * para que el admin lo vea.
 */
export default function Reservar() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  // Cargar propiedad para mostrar precio y capacidad en el resumen
  const { datos: propiedadData } = useApi(() => apiPropiedad.listarPropiedades(), []);
  const propiedad = propiedadData && propiedadData[0]
    ? enriquecerPropiedad(propiedadData[0])
    : propiedadDefault;

  const [fechas, setFechas] = useState({ desde: null, hasta: null });
  const [form, setForm] = useState({
    cantidadHuespedes: 4,
    telefonoContacto: '',
    sinVehiculo: false,
    vehiculo: { patente: '', modelo: '' },
    observaciones: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  // Cargar fechas guardadas y telefono del perfil
  useEffect(() => {
    if (!usuario) {
      navigate('/ingresar?volver=/reservar');
      return;
    }
    setForm((prev) => ({ ...prev, telefonoContacto: usuario.telefono || '' }));

    const guardadas = sessionStorage.getItem('fechasReserva');
    if (guardadas) setFechas(JSON.parse(guardadas));
    else navigate('/disponibilidad');
  }, [usuario, navigate]);

  // Cuando se carga la propiedad, ajustar huespedes al minimo valido
  useEffect(() => {
    if (propiedad && form.cantidadHuespedes < propiedad.capacidadMinima) {
      setForm((prev) => ({ ...prev, cantidadHuespedes: propiedad.capacidadMinima }));
    }
  }, [propiedad.capacidadMinima]);

  if (!fechas.desde) return null;

  const noches = calcularNoches(fechas.desde, fechas.hasta);
  const total = noches * propiedad.precioPorNoche;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      // Armar el payload para el backend. El telefono de contacto va
      // adentro de las observaciones para que el admin lo vea, junto
      // con un encabezado claro para las observaciones libres del huesped.
      const obsConTelefono = [
        form.telefonoContacto
          ? `Telefono de contacto: ${form.telefonoContacto}`
          : null,
        form.observaciones
          ? `Observaciones del huesped: ${form.observaciones}`
          : null,
      ].filter(Boolean).join('\n\n');

      const payload = {
        fecha_ingreso: fechas.desde,
        fecha_egreso: fechas.hasta,
        cantidad_huespedes: form.cantidadHuespedes,
        observaciones: obsConTelefono || undefined,
      };

      // Solo incluir vehiculo si el cliente no tildo "sin vehiculo"
      if (!form.sinVehiculo && form.vehiculo.patente && form.vehiculo.modelo) {
        payload.vehiculo = {
          patente: form.vehiculo.patente.trim().toUpperCase(),
          modelo: form.vehiculo.modelo.trim(),
        };
      }

      const reservaCreada = await apiReservas.crearReserva(payload);

      // Exito: limpiar fechas guardadas y navegar a la pagina de confirmacion
      // pasando la reserva real via state para no tener que volver a pedirla.
      sessionStorage.removeItem('fechasReserva');
      navigate(`/reserva-enviada/${reservaCreada.id}`, {
        state: { reserva: reservaCreada },
      });
    } catch (err) {
      const e = extraerError(err);
      setError(e);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <button onClick={() => navigate('/disponibilidad')} className="flex items-center gap-2 text-sm text-piedra-700 hover:text-musgo-700 mb-8">
        <ArrowLeft size={16} /> Volver a disponibilidad
      </button>

      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest text-terracota-600 mb-3">Último paso</div>
        <h1 className="font-display text-4xl md:text-5xl text-piedra-900">
          Contanos un poco <span className="italic text-musgo-700">de tu visita</span>
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Huéspedes */}
          <div className="tarjeta">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-musgo-100 text-musgo-700 flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <h3 className="font-display text-lg text-piedra-900">Cantidad de huéspedes</h3>
                <p className="text-xs text-piedra-600">Entre {propiedad.capacidadMinima} y {propiedad.capacidadMaxima} personas</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button type="button"
                onClick={() => setForm({ ...form, cantidadHuespedes: Math.max(propiedad.capacidadMinima, form.cantidadHuespedes - 1) })}
                disabled={enviando}
                className="w-12 h-12 rounded-full bg-crema-200 hover:bg-crema-300 text-piedra-900 font-bold text-xl transition-colors disabled:opacity-50">−</button>
              <div className="font-display text-4xl text-musgo-800 w-16 text-center">{form.cantidadHuespedes}</div>
              <button type="button"
                onClick={() => setForm({ ...form, cantidadHuespedes: Math.min(propiedad.capacidadMaxima, form.cantidadHuespedes + 1) })}
                disabled={enviando}
                className="w-12 h-12 rounded-full bg-crema-200 hover:bg-crema-300 text-piedra-900 font-bold text-xl transition-colors disabled:opacity-50">+</button>
            </div>
          </div>

          {/* Teléfono de contacto */}
          <div className="tarjeta">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-musgo-100 text-musgo-700 flex items-center justify-center">
                <Phone size={18} />
              </div>
              <div>
                <h3 className="font-display text-lg text-piedra-900">Teléfono de contacto</h3>
                <p className="text-xs text-piedra-600">
                  Te vamos a escribir por WhatsApp para coordinar la seña y darte la bienvenida
                </p>
              </div>
            </div>

            <input
              type="tel"
              required
              value={form.telefonoContacto}
              onChange={(e) => setForm({ ...form, telefonoContacto: e.target.value })}
              placeholder="+54 9 ..."
              className="input-natural"
              disabled={enviando}
            />
            <p className="text-xs text-piedra-600 mt-2 italic">
              Lo cargamos por defecto desde tu perfil. Si preferís que te contactemos a otro número, modificalo acá.
            </p>
          </div>

          {/* Vehículo */}
          <div className="tarjeta">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-musgo-100 text-musgo-700 flex items-center justify-center">
                <Car size={18} />
              </div>
              <div>
                <h3 className="font-display text-lg text-piedra-900">Vehículo</h3>
                <p className="text-xs text-piedra-600">La propiedad tiene cochera para 1 vehículo</p>
              </div>
            </div>

            {/* Checkbox: no llevo vehículo */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-crema-100 hover:bg-crema-200/70 cursor-pointer transition-colors mb-4">
              <input
                type="checkbox"
                checked={form.sinVehiculo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sinVehiculo: e.target.checked,
                    vehiculo: e.target.checked ? { patente: '', modelo: '' } : form.vehiculo,
                  })
                }
                disabled={enviando}
                className="mt-0.5 w-4 h-4 accent-musgo-700 cursor-pointer flex-shrink-0"
              />
              <div className="text-sm">
                <div className="font-medium text-piedra-900">No voy a llevar vehículo</div>
                <div className="text-xs text-piedra-600">Marcá esta opción si llegás sin auto</div>
              </div>
            </label>

            {!form.sinVehiculo && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-piedra-700 mb-2">Patente</label>
                  <input type="text" required value={form.vehiculo.patente}
                    onChange={(e) => setForm({ ...form, vehiculo: { ...form.vehiculo, patente: e.target.value.toUpperCase() } })}
                    placeholder="AB123CD" maxLength={10} className="input-natural uppercase"
                    disabled={enviando} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-piedra-700 mb-2">Modelo</label>
                  <input type="text" required value={form.vehiculo.modelo}
                    onChange={(e) => setForm({ ...form, vehiculo: { ...form.vehiculo, modelo: e.target.value } })}
                    placeholder="Marca y modelo" className="input-natural"
                    disabled={enviando} />
                </div>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div className="tarjeta">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-musgo-100 text-musgo-700 flex items-center justify-center">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="font-display text-lg text-piedra-900">¿Algo que tengamos que saber?</h3>
                <p className="text-xs text-piedra-600">Horario aproximado de llegada, mascotas, requerimientos especiales</p>
              </div>
            </div>
            <textarea value={form.observaciones}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              rows={4} placeholder="Opcional"
              className="input-natural resize-none"
              disabled={enviando} />
          </div>

          {/* Error de la API */}
          {error && (
            <div className="tarjeta border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-red-900 mb-1">
                    {error.codigo === 'CONFLICTO' && 'Las fechas ya no están disponibles'}
                    {error.codigo === 'REGLA_NEGOCIO' && 'No pudimos crear la reserva'}
                    {error.codigo === 'VALIDACION_FALLIDA' && 'Revisá los datos del formulario'}
                    {!['CONFLICTO', 'REGLA_NEGOCIO', 'VALIDACION_FALLIDA'].includes(error.codigo) && 'Ocurrió un error'}
                  </div>
                  <div className="text-sm text-red-700">{error.mensaje}</div>
                  {error.codigo === 'CONFLICTO' && (
                    <button
                      type="button"
                      onClick={() => navigate('/disponibilidad')}
                      className="mt-3 text-sm underline text-red-700 hover:text-red-900"
                    >
                      Elegir otras fechas →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn-principal w-full text-lg !py-4" disabled={enviando}>
            {enviando ? 'Enviando solicitud...' : (
              <>Confirmar solicitud <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        {/* Resumen */}
        <aside className="lg:col-span-1">
          <div className="tarjeta sticky top-24">
            <img src={propiedad.fotos[0]} alt="" className="w-full aspect-[4/3] object-cover rounded-2xl mb-4" />
            <h4 className="font-display text-xl text-piedra-900">{propiedad.nombre}</h4>
            <p className="text-xs text-piedra-600 mb-6">{propiedad.ubicacion}</p>

            <div className="space-y-3 text-sm border-t border-crema-200 pt-4">
              <div className="flex justify-between">
                <span className="text-piedra-700">Ingreso</span>
                <span className="font-medium">{formatearFecha(fechas.desde)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-piedra-700">Egreso</span>
                <span className="font-medium">{formatearFecha(fechas.hasta)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-piedra-700">Huéspedes</span>
                <span className="font-medium">{form.cantidadHuespedes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-piedra-700">{noches} noche{noches !== 1 ? 's' : ''}</span>
                <span className="font-medium">{formatearPrecio(propiedad.precioPorNoche * noches)}</span>
              </div>
            </div>

            <div className="border-t border-crema-200 mt-4 pt-4 flex justify-between font-display text-lg">
              <span>Total</span>
              <span className="text-musgo-800">{formatearPrecio(total)}</span>
            </div>

            <div className="mt-6 p-3 bg-musgo-100 rounded-xl text-xs text-musgo-800 flex gap-2">
              <Check size={16} className="flex-shrink-0 mt-0.5" />
              <span>Las fechas se bloquean por 2 horas. Te confirmamos por email.</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
