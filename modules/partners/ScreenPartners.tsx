'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Building2, Search, UserPlus, Phone, Mail, Loader2, Inbox } from 'lucide-react';
import { getAllPartners } from '@/request/partner';

export default function ScreenPartners() {
  const router = useRouter();
  const locale = useLocale();
  
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Cargar datos del servidor
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const data = await getAllPartners(); // Llama a tu controlador exports.getPartners
        setPartners(data);
      } catch (error) {
        console.error("Error al cargar socios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  // 2. Lógica de filtrado
  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.identification && p.identification.includes(searchTerm)) ||
    (p.phone && p.phone.includes(searchTerm))
  );

  return (
    <div className="w-full h-full p-6 text-slate-200 bg-[#0a1120] flex flex-col font-sans overflow-hidden">
      
      {/* HEADER */}
      <div className="mb-8 flex justify-between items-end px-2 shrink-0">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
            Directorio de Aliados<span className="text-blue-500">.</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em]">
            Gestión de contactos comerciales
          </p>
        </div>
        <button 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
          onClick={() => router.push(`/${locale}/partners/new`)} // Ruta para crear socio
        >
          <UserPlus size={16} /> Nuevo Aliado
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="relative mb-6 shrink-0">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="Buscar aliado por nombre, NIT o teléfono..."
          className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-4 pl-14 pr-6 outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLA O ESTADO DE CARGA */}
      <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden flex-1 shadow-2xl flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sincronizando con servidor...</span>
          </div>
        ) : filteredPartners.length > 0 ? (
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-[#0a1120] z-10 border-b border-white/5">
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="px-8 py-5">Entidad / Razón Social</th>
                  <th className="px-8 py-5">Identificación</th>
                  <th className="px-8 py-5">Contacto</th>
                  <th className="px-8 py-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPartners.map((partner) => (
                  <tr 
                    key={partner.id}
                    onClick={() => router.push(`/${locale}/partners/${partner.id}`)} 
                    className="group hover:bg-blue-600/10 transition-all cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                          <Building2 size={18} />
                        </div>
                        <span className="text-sm font-black text-white uppercase italic tracking-tight">{partner.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-400 font-mono">
                      {partner.identification || 'N/A'}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-2 text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
                            <Phone size={12} className="text-blue-500"/> {partner.phone || 'Sin Tel'}
                         </div>
                         <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold lowercase">
                            <Mail size={12}/> {partner.email || 'N/A'}
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-[9px] font-black bg-white/5 px-4 py-2 rounded-full uppercase text-blue-400 border border-blue-500/10 group-hover:border-blue-500/40 transition-all">
                        Ver Cuenta
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-40">
            <Inbox size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No se encontraron aliados comerciales</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}