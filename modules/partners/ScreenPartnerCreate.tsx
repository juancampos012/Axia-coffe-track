'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  ArrowLeft, Building2, UserPlus, 
  Hash, Phone, Mail, MapPin, Notebook, Loader2 
} from 'lucide-react';
import Cookies from "js-cookie"; 
import { jwtDecode } from "jwt-decode";
import { createPartner } from '@/request/partner';

export default function ScreenPartnerCreate() {
  const router = useRouter();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    identification: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // --- EXTRACCIÓN DEL TENANT ID DESDE LA COOKIE ---
      const authToken = Cookies.get("authToken");
      
      if (!authToken) {
        alert("Sesión expirada. Por favor, vuelve a iniciar sesión.");
        setLoading(false);
        return;
      }
      
      const decoded: any = jwtDecode(authToken);
      const tenantId = decoded.tenantId;

      if (!tenantId) {
        throw new Error("No se encontró el ID de la empresa en el token.");
      }

      // Enviamos los datos con el tenantId extraído del token
      await createPartner({ ...formData, tenantId });
      
      router.push(`/${locale}/partners`);
      router.refresh();
      
    } catch (error: any) {
      console.error("Error al crear aliado:", error);
      alert(error.message || "Error al crear el aliado comercial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-6 text-slate-200 bg-[#0a1120] flex flex-col font-sans overflow-hidden">
      
      {/* HEADER */}
      <div className="mb-8 flex items-center gap-6 shrink-0">
        <button 
          type="button"
          onClick={() => router.back()}
          className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all shadow-xl"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
            Registrar Nuevo <span className="text-blue-500">Aliado</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em]">Configuración de nueva cuenta comercial</p>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-start overflow-y-auto custom-scrollbar pb-10">
        <form 
          onSubmit={handleSubmit}
          className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 bg-white/[0.02] border border-white/10 p-10 md:p-14 rounded-[3rem] shadow-2xl relative"
        >
          {/* SECCIÓN 1: LEGAL */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-4">Información Legal</h3>
            
            <div className="space-y-2 font-bold italic">
              <label className="text-[10px] uppercase ml-2 text-slate-500">Nombre / Razón Social *</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Aliado SAS"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-blue-500/50 transition-all text-sm font-bold"
                />
              </div>
            </div>

            <div className="space-y-2 font-bold italic">
              <label className="text-[10px] uppercase ml-2 text-slate-500">NIT / Identificación</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  name="identification"
                  value={formData.identification}
                  onChange={handleChange}
                  placeholder="900.000.000-1"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-blue-500/50 transition-all text-sm font-bold"
                />
              </div>
            </div>

            <div className="space-y-2 font-bold italic">
              <label className="text-[10px] uppercase ml-2 text-slate-500">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+57 300 000 0000"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-blue-500/50 transition-all text-sm font-bold"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: CONTACTO */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-4">Ubicación y Notas</h3>

            <div className="space-y-2 font-bold italic">
              <label className="text-[10px] uppercase ml-2 text-slate-500">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contacto@aliado.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-blue-500/50 transition-all text-sm font-bold"
                />
              </div>
            </div>

            <div className="space-y-2 font-bold italic">
              <label className="text-[10px] uppercase ml-2 text-slate-500">Dirección Física</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Calle, Ciudad, Municipio"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-blue-500/50 transition-all text-sm font-bold"
                />
              </div>
            </div>

            <div className="space-y-2 font-bold italic">
              <label className="text-[10px] uppercase ml-2 text-slate-500">Notas Internas</label>
              <div className="relative">
                <Notebook className="absolute left-4 top-4 text-slate-500" size={18} />
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Detalles adicionales..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-blue-500/50 transition-all text-sm font-bold resize-none"
                />
              </div>
            </div>
          </div>

          {/* FOOTER ACCIONES */}
          <div className="md:col-span-2 pt-8 flex justify-end items-center gap-6 border-t border-white/5">
            <button 
              type="button"
              disabled={loading}
              onClick={() => router.back()}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button 
              disabled={loading}
              type="submit"
              className="flex items-center gap-4 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
              {loading ? 'Registrando...' : 'Finalizar Registro'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}