'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, User, KeyRound, Loader2, ShieldAlert } from 'lucide-react';
import CreateCompanyPage from './CreateCompanyPage';

/**
 * Puerta de acceso independiente del resto de la plataforma: no aparece en ningún
 * menú, no hereda el layout de /admin, y exige un login propio (usuario y clave
 * reales, verificados contra el backend) antes de mostrar el formulario de
 * creación de empresas. Solo se muestra el formulario si el usuario autenticado
 * tiene rol SUPERADMIN.
 */
export default function SecretCreateCompanyPage() {
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authorized, setAuthorized] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const loggedUser = await login(email, password);
      if (loggedUser?.role !== 'SUPERADMIN') {
        setError('Acceso denegado.');
        return;
      }
      setAuthorized(true);
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  if (authorized || user?.role === 'SUPERADMIN') {
    return <CreateCompanyPage />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#04060a' }}>
      <div
        className="max-w-sm w-full rounded-[2.5rem] p-10"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(74,127,255,0.1)' }}>
            <Lock size={24} style={{ color: '#4a7fff' }} />
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Acceso restringido</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Usuario"
              required
              className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium text-white outline-none transition-all"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
          <div className="relative">
            <KeyRound size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Clave"
              required
              className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium text-white outline-none transition-all"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400">
              <ShieldAlert size={12} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: 'rgba(74,127,255,0.15)', border: '1px solid rgba(74,127,255,0.3)' }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
