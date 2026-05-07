'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Receipt, 
  Calendar, 
  TrendingDown, 
  ArrowRight, 
  Loader2, 
  Search,
  Plus
} from 'lucide-react';
import { getExpenses } from '@/request/expense';

export default function ExpensesSection() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const data = await getExpenses();
        setExpenses(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar gastos");
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-white italic flex items-center gap-2">
            <Receipt className="text-red-500" size={24} />
            CONTROL DE GASTOS<span className="text-red-500">.</span>
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Registro de egresos y flujo de caja</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text"
              placeholder="Buscar concepto..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[11px] text-white outline-none focus:border-red-500/50 transition-all font-bold uppercase"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/es/expenses/new" className="bg-white text-black p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95">
            <Plus size={20} />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Loader2 className="animate-spin text-red-500" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Analizando estados financieros...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
            
            {filteredExpenses.map((exp) => (
              <div 
                key={exp.id}
                className="group bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:border-red-500/30 transition-all duration-500 flex flex-col shadow-xl relative overflow-hidden"
              >
                {/* Indicador de egreso */}
                <div className="absolute top-0 right-10 w-8 h-1 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(exp.createdAt).toLocaleDateString('es-CO')}
                  </span>
                  <TrendingDown size={14} className="text-red-500/50" />
                </div>

                <h3 className="text-sm font-black text-white uppercase leading-tight mb-4 line-clamp-2 min-h-[40px]">
                  {exp.description}
                </h3>

                <div className="pt-4 border-t border-white/5 flex items-end justify-between">
                  <div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">Monto Pagado</span>
                    <span className="text-2xl font-mono font-black text-red-400 italic">
                      -{formatCurrency(exp.amount)}
                    </span>
                  </div>
                  <Link href={`/es/expenses/${exp.id}`} className="w-10 h-10 bg-white/5 text-slate-400 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}