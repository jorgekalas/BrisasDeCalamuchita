import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../ContextoApp';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Ingresar() {
  const { iniciarSesion } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const volverA = searchParams.get('volver') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const resultado = iniciarSesion(email);
    if (resultado.ok) {
      // Si es admin, lo mandamos al panel; sino respetamos volverA
      if (resultado.usuario.rol === 'administrador') navigate('/admin');
      else navigate(volverA);
    } else {
      setError(resultado.error);
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
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">
            {error}. Probá con uno de los usuarios de demostración.
          </div>
        )}

        <button type="submit" className="btn-principal w-full">
          Ingresar <ArrowRight size={18} />
        </button>

        <div className="text-center text-sm text-piedra-700">
          ¿No tenés cuenta? <Link to="/registrarse" className="text-musgo-700 font-medium hover:underline">Registrate</Link>
        </div>
      </form>

      {/* Tip de demo: usuarios de prueba */}
      <div className="mt-6 p-4 rounded-2xl bg-crema-200/50 border border-crema-200 text-xs text-piedra-700">
        <div className="font-medium text-piedra-900 mb-2">👋 Esta es una demo. Probá con:</div>
        <ul className="space-y-1 font-mono">
          <li>📧 <button onClick={() => setEmail('maria@ejemplo.com')} className="underline hover:text-musgo-700">maria@ejemplo.com</button> · cliente</li>
          <li>📧 <button onClick={() => setEmail('admin@brisas.com.ar')} className="underline hover:text-musgo-700">admin@brisas.com.ar</button> · administrador</li>
        </ul>
        <div className="mt-2 italic">La contraseña no se valida en esta demo (cualquier texto funciona).</div>
      </div>
    </div>
  );
}
