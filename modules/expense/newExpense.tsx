'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createExpense } from '@/request/expense';
import { 
  DollarSign, 
  AlignLeft, 
  ArrowRight, 
  Loader2, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

export default function NewExpensePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!amount || !description) return alert("Completa todos los campos");
    
    try {
      setIsSubmitting(true);
      await createExpense({
        tenantId: user?.tenantId!, 
        amount: parseFloat(amount),
        description: description.trim()
      });
      router.push('/es/expenses/view');
    } catch (error: any) {
      alert(error.message || "Error al registrar el gasto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 text-slate-200">
      
      <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
        <ArrowLeft size={14} /> Volver
      </button>

      <header className="mb-12">
        <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase">
          Registrar Gasto<span className="text-red-500">.</span>
        </h1>
        <p className="mt-2 text-slate-500 uppercase tracking-[0.4em] text-[10px] font-bold">Salida de capital y afectación de balance</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* FORMULARIO */}
        <div className="lg:col-span-8 space-y-8">
          
          <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-transparent opacity-30" />
            
            <div className="space-y-10">
              {/* MONTO */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                  <DollarSign size={14} className="text-red-500" /> Valor del Gasto (COP)
                </label>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-black/40 border border-white/10 rounded-3xl p-8 text-6xl font-mono font-black text-white outline-none focus:border-red-500/50 transition-all"
                />
              </div>

              {/* DESCRIPCIÓN */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                  <AlignLeft size={14} className="text-red-500" /> Concepto o Descripción
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Pago de servicios públicos, Mantenimiento de maquinaria..."
                  className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 text-sm font-medium text-white outline-none focus:border-red-500/50 h-32 resize-none transition-all"
                />
              </div>
            </div>
          </section>

          <div className="flex items-center gap-4 p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem]">
            <AlertTriangle className="text-red-500 shrink-0" size={24} />
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
              Atención: Esta operación <span className="text-white">restará inmediatamente</span> el valor ingresado del saldo actual de la empresa. No se puede deshacer sin eliminar el registro.
            </p>
          </div>
        </div>

        {/* COLUMNA ACCIÓN */}
        <div className="lg:col-span-4">
          <div className="sticky top-10 bg-[#0d1525] border border-white/10 rounded-[3rem] p-10 shadow-2xl">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 border-b border-white/5 pb-6 mb-8 italic">Confirmación</h3>
            
            <div className="space-y-6 mb-10">
               <div>
                 <span className="text-[9px] font-bold text-slate-600 uppercase block">Total a Deducir</span>
                 <span className="text-4xl font-black font-mono text-white italic">
                   ${Number(amount || 0).toLocaleString('es-CO')}
                 </span>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl italic text-[11px] text-slate-400">
                 "{description || 'Sin descripción...'}"
               </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSubmitting || !amount || !description}
              className="w-full py-6 rounded-2xl bg-red-600 text-white hover:bg-red-500 transition-all font-black uppercase text-[11px] tracking-[0.4em] shadow-lg shadow-red-900/20 flex items-center justify-center gap-3 disabled:opacity-20 active:scale-95"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <>Ejecutar Gasto <ArrowRight size={18} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}