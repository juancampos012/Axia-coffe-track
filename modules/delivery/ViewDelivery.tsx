'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  Calendar, 
  Package, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  User, 
  Search
} from 'lucide-react';
import { getDeliveries } from '@/request/delivery'; // Asegúrate de tener este endpoint

export default function DeliveriesSection() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        const data = await getDeliveries();
        setDeliveries(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Error al cargar las entregas");
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // Filtrado por nombre de socio o producto
  const filteredDeliveries = deliveries.filter(d => 
    d.partner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-white italic flex items-center gap-2">
            <Truck className="text-[#1E3C8b]" size={24} />
            HISTORIAL DE ENTREGAS<span className="text-[#1E3C8b]">.</span>
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Registro de despachos y salidas a aliados</p>
        </div>

        {/* BUSCADOR RÁPIDO */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input 
            type="text"
            placeholder="Buscar aliado o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[11px] text-white outline-none focus:border-[#1E3C8b] transition-all font-bold uppercase tracking-widest"
          />
        </div>
      </div>

      {/* CONTADOR */}
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
        {filteredDeliveries.length} Registro(s) encontrado(s)
      </div>

      {/* ESTADO DE CARGA / ERROR */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Loader2 className="animate-spin text-[#1E3C8b]" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Cargando bitácora de movimientos...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-red-400 gap-3">
          <AlertCircle size={40} />
          <p className="text-sm font-bold">{error}</p>
          <button onClick={() => window.location.reload()} className="text-[10px] underline uppercase tracking-widest text-slate-500">Reintentar</button>
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Package className="text-6xl opacity-20" />
          <p className="text-sm font-bold text-center">No hay registros de entregas</p>
          <Link href="/es/delivery/new" className="text-[10px] bg-white/5 px-4 py-2 rounded-lg border border-white/10 uppercase tracking-widest text-white hover:bg-[#1E3C8b] transition-all">
            Crear primera entrega
          </Link>
        </div>
      ) : (
        /* GRID DE ENTREGAS */
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
            
            {/* BOTÓN CREAR NUEVO */}
            <Link 
              href="/es/delivery/new" 
              className="border-2 border-dashed border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 text-slate-500 hover:border-[#1E3C8b] hover:text-[#1E3C8b] transition-all group cursor-pointer bg-white/[0.02]"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#1E3C8b]/10 transition-colors">
                <Truck size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Registrar Entrega</span>
            </Link>

            {/* LISTADO DE ENTREGAS */}
            {filteredDeliveries.map((del) => (
              <div 
                key={del.id}
                className="group relative bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:border-[#1E3C8b]/50 transition-all duration-500 flex flex-col shadow-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-[10px] font-black text-[#1E3C8b] uppercase tracking-tighter italic">
                      <User size={12} /> {del.partner?.name || 'Socio no identificado'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(del.createdAt).toLocaleDateString('es-CO')}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Package size={16} className="text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase leading-tight group-hover:text-[#1E3C8b] transition-colors">
                    {del.product?.name || 'Materia Prima'}
                    </h3>
                </div>

                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-6 italic">
                  ID Operación: {del.id.substring(0, 8)}...
                </p>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-start gap-6">
                    {/* CANTIDAD + UNIDAD */}
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-slate-500 uppercase block">Cantidad</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-mono font-black text-white italic">
                          {Number(del.quantity ?? del.productKg ?? 0).toLocaleString('es-CO')}
                        </span>
                        <span className="text-[10px] text-[#1E3C8b] font-black italic uppercase">
                          {del.unit ?? 'kg'}
                        </span>
                      </div>
                    </div>

                    {/* KG EQUIVALENTES — solo si vienen del backend */}
                    {del.productKg != null && del.unit && del.unit !== 'kg' && (
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-500 uppercase block">Equiv. Kg</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-mono font-black text-slate-400 italic">
                            {Number(del.productKg).toLocaleString('es-CO')}
                          </span>
                          <span className="text-[9px] text-slate-500 font-black italic uppercase">kg</span>
                        </div>
                      </div>
                    )}

                    {/* PRECIO TOTAL — solo si viene */}
                    {del.pricePerUnit != null && (
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-500 uppercase block">Valor</span>
                        <span className="text-sm font-mono font-black text-emerald-400">
                          ${(Number(del.quantity ?? del.productKg ?? 0) * del.pricePerUnit).toLocaleString('es-CO')}
                        </span>
                      </div>
                    )}
                  </div>

                  <Link href={`/es/delivery/${del.id}`} className="w-10 h-10 bg-white/5 text-white rounded-full flex items-center justify-center hover:bg-[#1E3C8b] hover:scale-110 active:scale-95 transition-all">
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