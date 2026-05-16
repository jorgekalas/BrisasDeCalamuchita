import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../ContextoApp';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

export default function Registrarse() {
  const { iniciarSesion } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Para la demo, "registrarse" inicia sesión directamente como cliente.
    iniciarSesion('maria@ejemplo.com');
    navigate('/disponibilidad');
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl text-piedra-900 mb-2">
          Sumate a la <span className="italic text-musgo-700">familia</span>
        </h1>
        <p className="text-piedra-700 text-sm">Tu cuenta te permite gestionar reservas y recibir confirmaciones</p>
      </div>

      <form onSubmit={handleSubmit} className="tarjeta space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-piedra-700 mb-2">Nombre completo</label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-piedra-600" />
            <input type="text" required value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre y apellido" className="input-natural pl-10" />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-piedra-700 mb-2">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-piedra-600" />
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com" className="input-natural pl-10" />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-piedra-700 mb-2">Teléfono</label>
          <div className="relative">
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-piedra-600" />
            <input type="tel" required value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="+54 9 ..." className="input-natural pl-10" />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-piedra-700 mb-2">Contraseña</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-piedra-600" />
            <input type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 8 caracteres" className="input-natural pl-10" />
          </div>
        </div>

        <button type="submit" className="btn-principal w-full">
          Crear cuenta <ArrowRight size={18} />
        </button>

        <div className="text-center text-sm text-piedra-700">
          ¿Ya tenés cuenta? <Link to="/ingresar" className="text-musgo-700 font-medium hover:underline">Ingresá</Link>
        </div>
      </form>
    </div>
  );
}
