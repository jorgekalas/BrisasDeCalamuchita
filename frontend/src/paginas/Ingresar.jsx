import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexto/ContextoAuth';
import { extraerError } from '../api/cliente';
import { Mail, Lock, ArrowRight, AlertCircle, Clock } from 'lucide-react';

export default function Ingresar() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const volverA = searchParams.get('volver') || '/';
  const sesionExpiro = searchParams.get('expiro') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState(sesionExpiro ? 'Tu sesion expiro, por favor ingresa de nuevo.' : '');

  // Limpiar el aviso de "sesion expiro" cuando el usuario empieza a tipear
  useEffect(() => {
    if (aviso && (email || password)) setAviso('');
  }, [email, password, aviso]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const usuario = await iniciarSesion(email, password);
      // Si es admin, lo mandamos al panel; sino respetamos volverA
      if (usuario.tipo === 'administrador') {
        navigate('/admin');
      } else {
        navigate(volverA);
      }
    } catch (err) {
      const e = extraerError(err);
      setError(e.mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl text-piedra-900 mb-2">
          Bienvenido <span className="italic text-musgo-700">de vuelta</span>
        </h1>
        <p className="text-piedra-700 text-sm">Ingresá para gestionar tus reservas</p>
      </div>

      {aviso && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
          <Clock size={16} className="mt-0.5 flex-shrink-0" />
          <span>{aviso}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="tarjeta space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-widest text-piedra-700 mb-2">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-piedra-600" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="input-natural pl-10"
              autoComplete="email"
              disabled={enviando}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-piedra-700 mb-2">Contraseña</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-piedra-600" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-natural pl-10"
              autoComplete="current-password"
              disabled={enviando}
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 p-3 rounded-xl flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="btn-principal w-full" disabled={enviando}>
          {enviando ? 'Ingresando...' : (
            <>Ingresar <ArrowRight size={18} /></>
          )}
        </button>

        <div className="text-center text-sm text-piedra-700">
          ¿No tenés cuenta? <Link to="/registrarse" className="text-musgo-700 font-medium hover:underline">Registrate</Link>
        </div>
      </form>
    </div>
  );
}
