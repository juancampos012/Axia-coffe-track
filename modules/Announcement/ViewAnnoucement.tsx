'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Megaphone, Calendar, Tag, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { getAnnouncements } from '@/lib/api-announcements'; 
import { AnnouncementDAO } from "@/types/Api";

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<AnnouncementDAO[]>([]);
  const [filter, setFilter] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE'); // ✅ Predeterminado: ACTivos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carga de datos desde la API
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await getAnnouncements();
        setAnnouncements(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Error al cargar los anuncios");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const formatCurrency = (value: number) => 
    Number(value).toLocaleString('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    });

  // ✅ Filtro por isActive solamente
  const filteredAnnouncements = announcements.filter(a => {
    return filter === 'ACTIVE' ? a.isActive : !a.isActive;
  });

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-white italic flex items-center gap-2">
            <Megaphone className="text-[#1E3C8b]" size={24} />
            TABLERO DE ANUNCIOS<span className="text-[#1E3C8b]">.</span>
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Oportunidades y Contratos Vigentes</p>
        </div>

        {/* ✅ FILTROS SOLO ACTIVOS / INACTIVOS */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          {[
            { value: 'ACTIVE' as const, label: 'Activos' },
            { value: 'INACTIVE' as const, label: 'Inactivos' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                filter === value 
                  ? 'bg-[#1E3C8b] text-white shadow-lg' 
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTADOR DE RESULTADOS */}
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
        {filteredAnnouncements.length} {filter === 'ACTIVE' ? 'activo(s)' : 'inactivo(s)'}
        {announcements.length > 0 && (
          <span className="text-slate-700">de {announcements.length} total</span>
        )}
      </div>

      {/* ESTADO DE CARGA / ERROR */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Loader2 className="animate-spin text-[#1E3C8b]" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sincronizando con Axia...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-red-400 gap-3">
          <AlertCircle size={40} />
          <p className="text-sm font-bold">{error}</p>
          <button onClick={() => window.location.reload()} className="text-[10px] underline uppercase tracking-widest text-slate-500">Reintentar</button>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Tag className="text-6xl opacity-20" />
          <p className="text-sm font-bold text-center">
            No hay {filter === 'ACTIVE' ? 'anuncios activos' : 'anuncios inactivos'}
          </p>
          <p className="text-[10px] uppercase tracking-widest opacity-75">
            Cambia el filtro para ver otros resultados
          </p>
        </div>
      ) : (
        /* GRID DE ANUNCIOS */
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
            
            {/* BOTÓN CREAR NUEVO */}
            <Link 
              href="/es/announcements" 
              className="border-2 border-dashed border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 text-slate-500 hover:border-[#1E3C8b] hover:text-[#1E3C8b] transition-all group cursor-pointer bg-white/[0.02]"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#1E3C8b]/10 transition-colors">
                <Tag size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Crear Nuevo Anuncio</span>
            </Link>

            {/* LISTADO FILTRADO */}
            {filteredAnnouncements.map((ann) => (
              <div 
                key={ann.id}
                className={`group relative bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:border-[#1E3C8b]/50 transition-all duration-500 flex flex-col shadow-xl ${
                  !ann.isActive ? 'opacity-60 bg-white/3' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                    ann.isActive 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  }`}>
                    {ann.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(ann.createdAt || Date.now()).toLocaleDateString('es-CO')}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white uppercase leading-tight mb-2 group-hover:text-[#1E3C8b] transition-colors">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 flex-1 line-clamp-3 italic">
                  {ann.description || `Precio pactado para comercialización de café bajo condiciones de contrato ${ann.id.substring(0, 5)}.`}
                </p>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase block">Valor Unitario</span>
                    <span className="text-xl font-mono font-black text-white italic">
                      {formatCurrency(Number(ann.price || 0))}
                      <span className="text-[10px] text-slate-500 not-italic ml-1">/kg</span>
                    </span>
                  </div>
                  
                  <Link href={`/es/announcements/${ann.id}`} className="w-10 h-10 bg-[#1E3C8b] text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-[#1E3C8b]/20">
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #1E3C8b; }
      `}</style>
    </div>
  );
}