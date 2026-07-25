'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  ArrowLeft, Building2, Hash, Phone, MapPin,
  Image as ImageIcon, Loader2, CheckCircle2, X,
  User, Mail, KeyRound, UserPlus,
} from 'lucide-react';
import { createCompany } from '@/request/companies';
import { createUserForCompany } from '@/request/users';

const SECTORS = [
  { value: 'FOOD', label: 'Alimentos' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'TECHNOLOGY', label: 'Tecnología' },
  { value: 'HEALTH', label: 'Salud' },
];

export default function CreateCompanyPage() {
  const router = useRouter();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nit: '',
    name: '',
    address: '',
    phone: '',
    sector: 'FOOD',
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [newCompanyId, setNewCompanyId] = useState<string | null>(null);

  // ── Usuario ADMIN de la empresa recién creada ──────────────────────────────
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [userCreated, setUserCreated] = useState(false);
  const [userError, setUserError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogo(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const canSubmit = formData.nit && formData.name && formData.address && formData.phone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setLoading(true);
      const company = await createCompany({ ...formData, logo });
      setNewCompanyId(company.id);
      setSuccess(true);
    } catch (error: any) {
      alert(error.message || 'Error al crear la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyId || !userForm.name || !userForm.email || !userForm.password) return;
    setUserError('');
    try {
      setCreatingUser(true);
      await createUserForCompany({ ...userForm, role: 'ADMIN', tenantId: newCompanyId });
      setUserCreated(true);
    } catch (error: any) {
      setUserError(error.message || 'Error al crear el usuario');
    } finally {
      setCreatingUser(false);
    }
  };

  const resetForm = () => {
    setFormData({ nit: '', name: '', address: '', phone: '', sector: 'FOOD' });
    setLogo(null);
    setLogoPreview(null);
    setSuccess(false);
    setNewCompanyId(null);
    setUserForm({ name: '', email: '', password: '' });
    setUserCreated(false);
    setUserError('');
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0a1120' }}>
        <div className="max-w-md w-full rounded-[3rem] p-10" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <CheckCircle2 size={40} style={{ color: '#10b981' }} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              Empresa creada
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-8 text-slate-400">
              {formData.name} · con 5 productos base (Cafe Seco, Cafe Mojado, Cacao, Frijol, Pasilla) y un proveedor predeterminado
            </p>
          </div>

          {userCreated ? (
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-8">
                Usuario ADMIN creado — ya puede iniciar sesión
              </p>
              <button
                onClick={resetForm}
                className="w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white"
                style={{ background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)' }}
              >
                Crear otra empresa
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateUser} className="space-y-4 mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'rgba(74,127,255,0.8)' }}>
                <UserPlus size={14} /> Crear usuario ADMIN de esta empresa
              </h3>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><User size={11} /> Nombre</label>
                <input
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Mail size={11} /> Correo</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><KeyRound size={11} /> Contraseña</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                />
              </div>

              {userError && (
                <p className="text-[9px] font-bold uppercase tracking-widest text-red-400">{userError}</p>
              )}

              <button
                type="submit"
                disabled={creatingUser || !userForm.name || !userForm.email || !userForm.password}
                className="w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-30 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)' }}
              >
                {creatingUser ? <Loader2 size={14} className="animate-spin" /> : 'Crear usuario'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 pt-1"
              >
                Omitir y crear otra empresa
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10 text-slate-200" style={{ background: '#0a1120' }}>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <ArrowLeft size={14} /> Volver
        </button>

        <header className="mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
            <Building2 size={30} style={{ color: '#4a7fff' }} />
            Nueva Empresa<span style={{ color: '#4a7fff' }}>.</span>
          </h1>
          <p className="mt-2 text-slate-500 uppercase tracking-[0.4em] text-[10px] font-bold">
            Acceso restringido · Solo SUPERADMIN
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-[2.5rem] p-8 shadow-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(30,60,139,0.3)' }}>
            <h2 className="text-[10px] font-black uppercase tracking-widest mb-6" style={{ color: 'rgba(74,127,255,0.8)' }}>
              Datos de la empresa
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Building2 size={12} /> Nombre
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Innovative Enterprises"
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none transition-all"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Hash size={12} /> NIT
                </label>
                <input
                  name="nit"
                  value={formData.nit}
                  onChange={handleChange}
                  placeholder="900123456"
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none transition-all"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Phone size={12} /> Teléfono
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="3001234567"
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none transition-all"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Sector
                </label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none transition-all appearance-none cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                >
                  {SECTORS.map((s) => (
                    <option key={s.value} value={s.value} style={{ background: '#0a1120' }}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12} /> Dirección
                </label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Calle 123 #45-67"
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none transition-all"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                />
              </div>
            </div>
          </section>

          <section className="rounded-[2.5rem] p-8 shadow-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(30,60,139,0.3)' }}>
            <h2 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: 'rgba(74,127,255,0.8)' }}>
              <ImageIcon size={14} /> Logo de la empresa
            </h2>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-6 text-slate-600">
              Aparecerá en los recibos de venta generados en el sistema
            </p>

            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px dashed rgba(30,60,139,0.4)' }}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon size={28} className="text-slate-700" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
                {logo && (
                  <button
                    type="button"
                    onClick={() => { setLogo(null); setLogoPreview(null); }}
                    className="flex items-center gap-1 text-[9px] font-bold uppercase text-red-400 hover:text-red-300"
                  >
                    <X size={12} /> Quitar logo
                  </button>
                )}
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 transition-all disabled:opacity-20 active:scale-95 text-white"
            style={{ background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)' }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Crear empresa'}
          </button>
        </form>
      </div>
    </div>
  );
}
