'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import SearchBarUniversal from '@/components/molecules/SearchBar';
import { ClientDAO, ProductDAO } from '@/types/Api';
import { createAnnouncement } from '@/request/announcement';
import { User, Package, FileText, Scale, DollarSign, X } from 'lucide-react';

export default function ScreenCreateAnnouncement() {
  const { user } = useAuth();
  const [selectedClient, setSelectedClient] = useState<ClientDAO | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDAO | null>(null);
  const [title, setTitle] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!selectedClient || !selectedProduct || !totalQuantity || !price || !title) {
      alert("⚠️ Por favor completa todos los campos.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createAnnouncement({
        tenantId: user?.tenantId,
        clientId: selectedClient.id,
        // @ts-ignore
        productId: selectedProduct.id,
        title,
        totalQuantity: parseFloat(totalQuantity),
        remantQuantity: parseFloat(totalQuantity),
        price: parseFloat(price),
        isActive: true
      });

      alert("✅ Fijación creada con éxito");
      resetForm();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setTotalQuantity('');
    setPrice('');
    setSelectedClient(null);
    setSelectedProduct(null);
  };

  return (
    // Se cambió max-w-4xl a max-w-7xl para darle más amplitud
    <div className="max-w-7xl mx-auto p-6 md:p-10">
      
      {/* HEADER */}
      <header className="mb-12 border-b border-white/10 pb-8">
        <h2 className="text-5xl font-black text-white italic tracking-tighter">
          Nuevo Anuncio<span className="text-[#1E3C8b]">.</span>
        </h2>
        <p className="text-slate-500 font-medium mt-2 uppercase text-[11px] tracking-[0.3em]">
          Contratos de precio pactado / Gestión de Riesgo Operativo
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* COLUMNA IZQUIERDA: CONFIGURACIÓN (Ocupa 8 de 12 columnas) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* SECCIÓN ACTORES */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md relative z-[50] shadow-2xl">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#1E3C8b] mb-8 flex items-center gap-3 italic">
              <span className="w-6 h-[1px] bg-[#1E3C8b]"></span>
              <User size={16} /> Paso 1: Partes involucradas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Cliente Beneficiario</label>
                <SearchBarUniversal
                  searchType="clients"
                  onAddToCart={(item) => setSelectedClient(item as ClientDAO)}
                  showResults={true}
                  placeholder="Buscar por nombre o NIT..."
                />  
                {selectedClient && (
                  <div className="flex items-center justify-between p-4 bg-[#1E3C8b]/10 border border-[#1E3C8b]/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1E3C8b] flex items-center justify-center text-xs font-black italic">
                        {selectedClient.firstName.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-white uppercase tracking-tight">
                        {selectedClient.firstName} {selectedClient.lastName}
                      </span>
                    </div>
                    <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                      <X size={18} className="text-slate-500 hover:text-red-400" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Producto Vinculado</label>
                <SearchBarUniversal
                  searchType="products"
                  onAddToCart={(item) => setSelectedProduct(item as ProductDAO)}
                  showResults={true}
                  placeholder="¿Qué café se pacta?"
                />
                {selectedProduct && (
                  <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                        <Package size={18} />
                      </div>
                      <span className="text-sm font-bold text-white uppercase tracking-tight">{selectedProduct.name}</span>
                    </div>
                    <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                      <X size={18} className="text-slate-500 hover:text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN CONDICIONES */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md relative z-[40] shadow-2xl">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#1E3C8b] mb-8 flex items-center gap-3 italic">
              <span className="w-6 h-[1px] bg-[#1E3C8b]"></span>
              <FileText size={16} /> Paso 2: Detalles del Pacto
            </h3>
            
            <div className="space-y-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 tracking-widest">Referencia del Contrato</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: COSECHA PRINCIPAL 2026 - PACTO ANTICIPADO"
                  className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-xl font-black text-white outline-none focus:border-[#1E3C8b] transition-all placeholder:text-white/10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 flex items-center gap-2 tracking-widest">
                    <Scale size={14} className="text-[#1E3C8b]" /> Cantidad Total (kg)
                  </label>
                  <input
                    type="number"
                    value={totalQuantity}
                    onChange={(e) => setTotalQuantity(e.target.value)}
                    placeholder="0.00"
                    className="h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-2xl font-mono font-bold text-white outline-none focus:border-[#1E3C8b]"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 flex items-center gap-2 tracking-widest">
                    <DollarSign size={14} className="text-[#1E3C8b]" /> Precio Pactado x Kilo
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="$ 0"
                    className="h-16 bg-[#1E3C8b]/10 border border-[#1E3C8b]/30 rounded-2xl px-6 text-2xl font-mono font-bold text-blue-400 outline-none focus:border-[#1E3C8b]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RESUMEN Y ACCIÓN (Ocupa 4 de 12 columnas) */}
        <div className="lg:col-span-4">
          <div className="bg-[#111827] border border-white/10 p-10 rounded-[3rem] sticky top-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-12 text-slate-500 border-b border-white/5 pb-4">
              Liquidación Proyectada
            </h3>
            
            <div className="space-y-8 mb-12">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Valor de Operación</span>
                <span className="text-4xl font-black font-mono tracking-tighter text-white">
                  $ {(Number(totalQuantity || 0) * Number(price || 0)).toLocaleString('es-CO')}
                </span>
                <span className="text-[8px] text-blue-500 font-bold">MONEDA: PESO COLOMBIANO (COP)</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Estado</span>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase italic">Garantizado</span>
                </div>
                
                <div className="flex flex-col gap-3 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Resumen de Pacto</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    Se fijará un precio de <span className="text-white font-bold">${Number(price || 0).toLocaleString('es-CO')}</span> por kilo para un total de <span className="text-white font-bold">{totalQuantity || 0} kg</span>.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="w-full py-6 bg-[#1E3C8b] text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-blue-600 transition-all shadow-[0_10px_20px_rgba(30,60,139,0.3)] disabled:opacity-20 active:scale-[0.98]"
              >
                {isSubmitting ? "Generando Contrato..." : "Confirmar Fijación"}
              </button>
              <button 
                onClick={resetForm}
                className="w-full py-4 text-[10px] font-black text-slate-600 hover:text-red-400 uppercase tracking-widest transition-colors"
              >
                Cancelar y Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}