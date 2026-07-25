'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Building2, Hash, Phone, MapPin, Image as ImageIcon, X,
  Loader2, Save, User, Mail, KeyRound, CheckCircle2,
} from 'lucide-react';
import { getCompanyById, updateCompany } from '@/request/companies';
import { updateOwnAccount, getUserById } from '@/request/users';
import { envVariables } from '@/utils/config';

// Navegadores no pueden mostrar HEIC/HEIF (fotos de iPhone) ni otros formatos raros en <img>
const ACCEPTED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export default function CompanySettingsPage() {
  const { user } = useAuth();

  // ── Empresa ──────────────────────────────────────────────────────────────
  const [companyForm, setCompanyForm] = useState({ nit: '', name: '', address: '', phone: '', sector: 'FOOD' });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoBroken, setLogoBroken] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);
  const [companySaved, setCompanySaved] = useState(false);

  // ── Cuenta ───────────────────────────────────────────────────────────────
  const [accountForm, setAccountForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountSaved, setAccountSaved] = useState(false);
  const [accountError, setAccountError] = useState('');

  useEffect(() => {
    if (!user?.tenantId) return;
    getCompanyById(user.tenantId)
      .then((c) => {
        setCompanyForm({ nit: c.nit, name: c.name, address: c.address, phone: c.phone, sector: c.sector || 'FOOD' });
        if (c.logoUrl) {
          const serverOrigin = (envVariables.API_URL || '').replace(/\/api\/v1\/?$/, '');
          setLogoPreview(`${serverOrigin}${c.logoUrl}`);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCompany(false));
  }, [user?.tenantId]);

  // El JWT de sesión solo trae id/role/tenantId (no name/email), así que hay que
  // pedir el registro real del usuario para poder mostrar sus datos actuales.
  useEffect(() => {
    if (!user?.id) return;
    getUserById(user.id)
      .then((u) => setAccountForm((prev) => ({ ...prev, name: u.name || '', email: u.email || '' })))
      .catch(() => {})
      .finally(() => setLoadingAccount(false));
  }, [user?.id]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoError('');
    if (file && !ACCEPTED_LOGO_TYPES.includes(file.type)) {
      setLogoError('Formato no soportado. Usa PNG, JPG o WEBP (no HEIC/HEIF de iPhone).');
      e.target.value = '';
      return;
    }
    setLogo(file);
    setLogoBroken(false);
    if (file) setLogoPreview(URL.createObjectURL(file));
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;
    try {
      setSavingCompany(true);
      setCompanySaved(false);
      await updateCompany(user.tenantId, { ...companyForm, logo });
      setCompanySaved(true);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar la empresa');
    } finally {
      setSavingCompany(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setAccountError('');

    if (accountForm.password && accountForm.password !== accountForm.confirmPassword) {
      setAccountError('Las contraseñas no coinciden');
      return;
    }

    try {
      setSavingAccount(true);
      setAccountSaved(false);
      const body: { name?: string; email?: string; password?: string } = {
        name: accountForm.name,
        email: accountForm.email,
      };
      if (accountForm.password) body.password = accountForm.password;

      await updateOwnAccount(user.id, body);
      setAccountForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      setAccountSaved(true);
    } catch (err: any) {
      setAccountError(err.message || 'Error al actualizar la cuenta');
    } finally {
      setSavingAccount(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 text-slate-200" style={{ background: '#0a1120' }}>
      <div className="max-w-3xl mx-auto space-y-10">
        <header>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
            <Building2 size={30} style={{ color: '#4a7fff' }} />
            Configuración<span style={{ color: '#4a7fff' }}>.</span>
          </h1>
          <p className="mt-2 text-slate-500 uppercase tracking-[0.4em] text-[10px] font-bold">
            Datos de la empresa y de tu cuenta
          </p>
        </header>

        {/* ── EMPRESA ── */}
        <form onSubmit={handleSaveCompany} className="space-y-6">
          <section className="rounded-[2.5rem] p-8 shadow-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(30,60,139,0.3)' }}>
            <h2 className="text-[10px] font-black uppercase tracking-widest mb-6" style={{ color: 'rgba(74,127,255,0.8)' }}>
              Datos de la empresa
            </h2>

            {loadingCompany ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin" style={{ color: '#4a7fff' }} /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Building2 size={12} /> Nombre
                    </label>
                    <input
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none transition-all"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Hash size={12} /> NIT
                    </label>
                    <input
                      value={companyForm.nit}
                      onChange={(e) => setCompanyForm({ ...companyForm, nit: e.target.value })}
                      className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none transition-all"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Phone size={12} /> Teléfono
                    </label>
                    <input
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                      className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none transition-all"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={12} /> Dirección
                    </label>
                    <input
                      value={companyForm.address}
                      onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                      className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none transition-all"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden mt-6"
                    style={{ background: 'rgba(0,0,0,0.4)', border: '1px dashed rgba(30,60,139,0.4)' }}
                  >
                    {logoPreview && !logoBroken ? (
                      <img
                        src={logoPreview}
                        alt=""
                        className="w-full h-full object-contain"
                        onError={() => setLogoBroken(true)}
                      />
                    ) : (
                      <ImageIcon size={24} className="text-slate-700" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2 mt-6">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Logo</label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoChange}
                      className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                    />
                    <p className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">PNG, JPG o WEBP</p>
                    {logoError && (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-red-400">{logoError}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>

          <button
            type="submit"
            disabled={savingCompany || loadingCompany}
            className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 transition-all disabled:opacity-40 text-white"
            style={{ background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)' }}
          >
            {savingCompany ? <Loader2 className="animate-spin" size={16} /> : companySaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {savingCompany ? 'Guardando...' : companySaved ? 'Guardado' : 'Guardar datos de la empresa'}
          </button>
        </form>

        {/* ── CUENTA ── */}
        <form onSubmit={handleSaveAccount} className="space-y-6">
          <section className="rounded-[2.5rem] p-8 shadow-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(30,60,139,0.3)' }}>
            <h2 className="text-[10px] font-black uppercase tracking-widest mb-6" style={{ color: 'rgba(74,127,255,0.8)' }}>
              Tu cuenta
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} /> Nombre
                </label>
                <input
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none transition-all"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={12} /> Correo
                </label>
                <input
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none transition-all"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <KeyRound size={12} /> Nueva contraseña <span className="text-slate-700 normal-case font-medium">(opcional)</span>
                </label>
                <input
                  type="password"
                  value={accountForm.password}
                  onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                  placeholder="Dejar vacío para no cambiarla"
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none transition-all"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <KeyRound size={12} /> Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={accountForm.confirmPassword}
                  onChange={(e) => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
                  className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none transition-all"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                />
              </div>
            </div>

            {accountError && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-4">{accountError}</p>
            )}
          </section>

          <button
            type="submit"
            disabled={savingAccount || loadingAccount}
            className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 transition-all disabled:opacity-40 text-white"
            style={{ background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)' }}
          >
            {savingAccount ? <Loader2 className="animate-spin" size={16} /> : accountSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {savingAccount ? 'Guardando...' : accountSaved ? 'Guardado' : 'Guardar cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
