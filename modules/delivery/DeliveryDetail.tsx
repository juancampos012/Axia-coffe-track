'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Truck, 
  Calendar, 
  Package, 
  User, 
  Hash, 
  Scale, 
  Download, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { getDeliveryById, deleteDelivery } from '@/request/delivery'; 

export default function DeliveryDetailPage({ deliveryId }: { deliveryId: string }) {
  const router = useRouter();
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        setLoading(true);
        const data = await getDeliveryById(deliveryId);
        setDelivery(data);
      } catch (error) {
        console.error("Error al cargar la entrega:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDelivery();
  }, [deliveryId]);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este registro? Esto no devolverá el stock automáticamente.")) return;
    try {
      setIsDeleting(true);
      await deleteDelivery(deliveryId);
      router.push('/es/deliveries');
    } catch (error) {
      alert("Error al eliminar");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#0a1120]">
        <Loader2 className="animate-spin text-[#1E3C8b] mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Consultando manifiesto...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 text-slate-200">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <div className="flex justify-between items-center mb-12">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Volver a Entregas
        </button>
        
        <div className="flex gap-4">
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-slate-400 hover:text-white">
                <Download size={18} />
            </button>
            <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-red-500"
            >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
        </div>
      </div>

      {/* CUERPO DEL COMPROBANTE (ESTILO TICKET) */}
      <div className="relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#1E3C8b]/10 blur-[100px] rounded-full" />
        
        <div className="bg-[#0d1525] border border-white/10 rounded-[3rem] shadow-2xl relative z-10 overflow-hidden">
          
          {/* HEADER DEL TICKET */}
          <div className="bg-gradient-to-r from-[#1E3C8b] to-blue-900 p-10 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 text-white/70 uppercase text-[10px] font-black tracking-[0.3em] mb-2">
                <CheckCircle2 size={14} className="text-emerald-400" /> Registro Confirmado
              </div>
              <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
                Comprobante de Salida
              </h1>
            </div>
            <div className="text-right">
                <Truck size={48} className="text-white/20" />
            </div>
          </div>

          <div className="p-10 space-y-12">
            
            {/* GRID DE DATOS PRINCIPALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* BLOQUE IZQUIERDO: ACTORES */}
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-[#1E3C8b]">
                    <User size={24} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1 italic">Aliado Comercial / Receptor</label>
                    <p className="text-xl font-black text-white uppercase italic">{delivery?.partner?.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">NIT: {delivery?.partner?.nit || '---'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-emerald-500">
                    <Package size={24} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1 italic">Materia Prima Despachada</label>
                    <p className="text-xl font-black text-white uppercase italic">{delivery?.product?.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Cód. Producto: {delivery?.product?.id.substring(0,8)}</p>
                  </div>
                </div>
              </div>

              {/* BLOQUE DERECHO: MÉTRICAS Y TIEMPO */}
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-amber-500">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1 italic">Fecha y Hora de Registro</label>
                    <p className="text-xl font-black text-white uppercase italic">
                        {new Date(delivery?.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                        {new Date(delivery?.createdAt).toLocaleTimeString('es-CO')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-blue-400">
                    <Hash size={24} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1 italic">Número de Operación</label>
                    <p className="text-xl font-black text-white uppercase italic">#{delivery?.id.substring(0,12).toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN DE PESO - RESALTADO */}
            <div className="bg-white/[0.03] border-2 border-dashed border-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1E3C8b] to-transparent opacity-50" />
               <Scale size={40} className="text-[#1E3C8b] mb-4 opacity-50" />
               <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Peso Neto Certificado</span>
               <div className="flex items-baseline gap-3">
                  <span className="text-8xl font-black font-mono text-white tracking-tighter italic">
                    {Number(delivery?.productKg).toLocaleString('es-CO')}
                  </span>
                  <span className="text-3xl font-black text-[#1E3C8b] italic">KG</span>
               </div>
            </div>

            {/* PIE DE PÁGINA DEL TICKET */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5">
                <div className="flex items-center gap-3 text-slate-500 italic">
                    <AlertCircle size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Este documento es un registro digital de inventario</span>
                </div>
                <div className="text-[10px] font-black text-white uppercase tracking-[0.2em] px-6 py-2 bg-white/5 rounded-full border border-white/10 italic">
                    Status: Sincronizado
                </div>
            </div>
          </div>
        </div>

        {/* Efecto de bordes de ticket en el fondo (opcional) */}
        <div className="flex justify-between px-12 -mt-1 relative z-20">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-[#0a1120] rounded-full" />
            ))}
        </div>
      </div>
    </div>
  );
}