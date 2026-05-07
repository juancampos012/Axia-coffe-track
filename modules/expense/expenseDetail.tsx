'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Receipt, 
  Calendar, 
  DollarSign, 
  AlignLeft, 
  Trash2, 
  Loader2,
  AlertCircle,
  Building2,
  Clock,
  Download
} from 'lucide-react';
import { getExpenseById, deleteExpense } from '@/request/expense';

export default function ExpenseDetailPage({ expenseId }: { expenseId: string }) {
  const router = useRouter();
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const data = await getExpenseById(expenseId);
        setExpense(data);
      } catch (error) {
        console.error("Error al cargar el gasto:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [expenseId]);

  const handleDelete = async () => {
    if (!confirm("¿Deseas eliminar este registro? El monto se devolverá al balance de la empresa.")) return;
    try {
      setIsDeleting(true);
      await deleteExpense(expenseId);
      router.push('/es/expenses/view');
    } catch (error) {
      alert("Error al eliminar el registro");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#0a1120]">
        <Loader2 className="animate-spin text-red-500 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Consultando registro contable...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 text-slate-200">
      
      {/* HEADER DE ACCIONES */}
      <div className="flex justify-between items-center mb-12">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Volver a Gastos
        </button>
        
        <div className="flex gap-4">
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-slate-400">
                <Download size={18} />
            </button>
            <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/30 transition-all text-red-500"
            >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        {/* Glow decorativo de fondo */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full" />
        
        <div className="bg-[#0d1525] border border-white/10 rounded-[3rem] shadow-2xl relative z-10 overflow-hidden">
          
          {/* ENCABEZADO TIPO FACTURA */}
          <div className="bg-gradient-to-r from-red-600 to-red-900 p-10 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 text-white/70 uppercase text-[10px] font-black tracking-[0.3em] mb-2">
                <Receipt size={14} /> Egreso de Caja
              </div>
              <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
                Detalle del Gasto
              </h1>
            </div>
            <div className="text-right flex flex-col items-end">
                <span className="text-[10px] font-black text-red-200 uppercase tracking-widest mb-1">ID Transacción</span>
                <span className="text-xs font-mono text-white/50 bg-black/20 px-3 py-1 rounded-lg">
                    #{expense?.id.substring(0, 14).toUpperCase()}
                </span>
            </div>
          </div>

          <div className="p-10 space-y-12">
            
            {/* GRID DE INFORMACIÓN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-red-500">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1 italic">Entidad Emisora</label>
                    <p className="text-xl font-black text-white uppercase italic">{expense?.tenant?.name || 'Empresa Principal'}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Centro de Costos Operativo</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-slate-400">
                    <AlignLeft size={24} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1 italic">Concepto de Pago</label>
                    <p className="text-md font-bold text-slate-200 leading-relaxed italic">
                        "{expense?.description}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-amber-500">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1 italic">Fecha de Ejecución</label>
                    <p className="text-xl font-black text-white uppercase italic">
                        {new Date(expense?.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-slate-500">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase">{new Date(expense?.createdAt).toLocaleTimeString('es-CO')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MONTO RESALTADO */}
            <div className="bg-red-500/5 border-2 border-dashed border-red-500/20 rounded-[2rem] p-10 flex flex-col items-center justify-center relative">
               <DollarSign size={40} className="text-red-500 mb-4 opacity-50" />
               <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Total Deducido del Balance</span>
               <div className="flex items-baseline gap-3">
                  <span className="text-7xl font-black font-mono text-red-500 tracking-tighter italic">
                    -{formatCurrency(expense?.amount).replace('COP', '')}
                  </span>
                  <span className="text-2xl font-black text-red-700 italic tracking-widest">COP</span>
               </div>
            </div>

            {/* ADVERTENCIA DE REVERSIÓN */}
            <div className="flex items-center gap-4 p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">
                    Nota: La eliminación de este registro disparará un evento de <span className="text-white">reversión de balance</span>, devolviendo automáticamente el monto al saldo actual de la compañía.
                </p>
            </div>
          </div>
        </div>

        {/* Decoración inferior de ticket */}
        <div className="flex justify-between px-12 -mt-1 relative z-20">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="w-5 h-5 bg-[#0a1120] rounded-full" />
            ))}
        </div>
      </div>
    </div>
  );
}