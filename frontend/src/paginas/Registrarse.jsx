import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexto/ContextoAuth';
import { extraerError } from '../api/cliente';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function Registrarse() {
  const { registrar } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
  });

  const [errores, setErrores] = useState({});      // errores por campo
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const setCampo = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
    // Limpiar el error del campo si se esta corrigiendo
    if (errores[campo]) {
      const nuevos = { ...errores };
      delete nuevos[campo];
      setErrores(nuevos);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores({});
    setErrorGeneral('');
    setEnviando(true);

    try {
      await registrar({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        password: form.password,
      });
      // Auto-login exitoso, ir a disponibilidad
      navigate('/disponibilidad');
    } catch (err) {
      const e = extraerError(err);

      // Si el backend devolvió detalles por campo (validacion Zod), los mostramos
      if (e.detalles && Array.isArray(e.detalles)) {
        const erroresPorCampo = {};
        for (const d of e.detalles) {
          erroresPorCampo[d.campo] = d.mensaje;
        }
        setErrores(erroresPorCampo);
      } else {
        setErrorGeneral(e.mensaje);
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl text-piedra-900 mb-2">
          Sumate a la <span className="italic text-musgo-700">familia</span>
        </h1>
        <p className="text-piedra-700 text-sm">
          Tu cuenta te permite gestionar reservas y recibir confirmaciones
        </p>
      </div>

      <form onSubmit={handleSubmit} className="tarjeta space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-piedra-700 mb-2">Nombre</label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-piedra-600" />
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setCampo('nombre', e.target.value)}
              placeholder="Nombre"
              className="input-natural pl-10"
              disabled={enviando}
            />
          </div>
          {errores.nombre && <p className="text-xs text-red-700 mt-1">{errores.nombre}</p>}
        </div>

        {/* Apellido */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-piedra-700 mb-2">Apellido</label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-piedra-600" />
            <input
              type="text"
              required
              value={form.apellido}
              onChange={(e) => setCampo('apellido', e.target.value)}
              placeholder="Apellido"
              className="input-natural pl-10"
              disabled={enviando}
            />
          </div>
          {errores.apellido && <p className="text-xs text-red-700 mt-1">{errores.apellido}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-piedra-700 mb-2">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-piedra-600" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setCampo('email', e.target.value)}
              placeholder="tu@email.com"
              className="input-natural pl-10"
              autoComplete="email"
              disabled={enviando}
            />
          </div>
          {errores.email && <p className="text-xs text-red-700 mt-1">{errores.email}</p>}
        </div>

        {/* Telefono */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-piedra-700 mb-2">Teléfono</label>
          <div className="relative">
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-piedra-600" />
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => setCampo('telefono', e.target.value)}
              placeholder="+54 9 ..."
              className="input-natural pl-10"
              disabled={enviando}
            />
          </div>
          {errores.telefono && <p className="text-xs text-red-700 mt-1">{errores.telefono}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-piedra-700 mb-2">Contraseña</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-piedra-600" />
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setCampo('password', e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="input-natural pl-10"
              autoComplete="new-password"
              disabled={enviando}
            />
          </div>
          {errores.password && <p className="text-xs text-red-700 mt-1">{errores.password}</p>}
        </div>

        {errorGeneral && (
          <div className="text-sm text-red-700 bg-red-50 p-3 rounded-xl flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{errorGeneral}</span>
          </div>
        )}

        <button type="submit" className="btn-principal w-full" disabled={enviando}>
          {enviando ? 'Creando cuenta...' : (
            <>Crear cuenta <ArrowRight size={18} /></>
          )}
        </button>

        <div className="text-center text-sm text-piedra-700">
          ¿Ya tenés cuenta? <Link to="/ingresar" className="text-musgo-700 font-medium hover:underline">Ingresá</Link>
        </div>
      </form>
    </div>
  );
}
