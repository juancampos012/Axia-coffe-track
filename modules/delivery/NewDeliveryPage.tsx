'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import SearchBarUniversal from '@/components/molecules/SearchBar';
import { PartnerDAO, ProductDAO } from '@/types/Api';
import { createDelivery } from '@/request/delivery';
import { getAllPartners } from '@/request/partner';
import {
  Truck,
  Package,
  Users,
  Scale,
  X,
  Loader2,
  ArrowRight,
  Hash,
  ChevronDown
} from 'lucide-react';

export default function NewDeliveryPage() {
  const { user } = useAuth();

  const [partners, setPartners] = useState<PartnerDAO[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDAO | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [productKg, setProductKg] = useState('');
  
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoadingPartners(true);
        const data = await getAllPartners();
        setPartners(data);
      } catch (error) {
        console.error("Error al cargar socios:", error);
      } finally {
        setLoadingPartners(false);
      }
    };
    fetchPartners();
  }, []);

  const selectedPartner = partners.find(p => p.id === selectedPartnerId);
  const canWriteQuantity = selectedProduct && selectedPartnerId;

  const resetForm = () => {
    setSelectedProduct(null);
    setSelectedPartnerId('');
    setProductKg('');
  };

  const handleSave = async () => {
    if (!selectedProduct || !selectedPartnerId || !productKg) {
      alert('⚠️ Completa todos los campos obligatorios');
      return;
    }

    try {
      setIsSubmitting(true);
      await createDelivery({
        tenantId: user?.tenantId,
        partnerId: selectedPartnerId,
        productId: selectedProduct.id,
        productKg: parseFloat(productKg),
      });

      alert('✅ Entrega registrada correctamente');
      resetForm();
    } catch (error: any) {
      alert(error.message || 'Error al registrar entrega');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 bg-[#0a1120] min-h-screen text-slate-200">
      
      <header className="mb-12 border-b border-white/10 pb-8">
        <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase">
          Nueva Entrega<span className="text-[#1E3C8b]">.</span>
        </h1>
        <p className="mt-2 text-slate-500 uppercase tracking-[0.4em] text-[10px] font-bold">
          Registro operativo de despacho a aliados comerciales
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-8 space-y-8">

          {/* PASO 1: CONFIGURACIÓN - IMPORTANTE: z-index alto y sin overflow-hidden */}
          <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md shadow-2xl relative z-[60]">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#1E3C8b] mb-8 flex items-center gap-3 italic">
              <span className="w-6 h-[1px] bg-[#1E3C8b]" />
              <Truck size={16} />
              Paso 1: Configurar entrega
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* SELECT DE ALIADOS */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">
                  Aliado / Socio Receptor
                </label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1E3C8b]/50" size={16} />
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-10 outline-none focus:border-[#1E3C8b] transition-all text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer text-white"
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                  >
                    <option value="" className="bg-[#0a1120]">-- Seleccionar Aliado --</option>
                    {partners.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#0a1120]">{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* PRODUCTO - Aquí es donde el SearchBar desplegará la lista */}
              <div className="space-y-4 relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">
                  Producto
                </label>
                
                {/* SearchBarUniversal debe tener z-50 interno */}
                <SearchBarUniversal
                  searchType="products"
                  placeholder="Buscar producto..."
                  showResults={true}
                  onAddToCart={(item) => setSelectedProduct(item as ProductDAO)}
                />
                
                {selectedProduct && (
                  <div className="mt-4 flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                        <Package size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase">{selectedProduct.name}</p>
                        <p className="text-[9px] text-emerald-500 font-bold uppercase">Stock: {selectedProduct.stock} kg</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-white/5 rounded-full">
                      <X size={16} className="text-slate-500 hover:text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* PASO 2: CANTIDAD - z-index menor que la sección de arriba */}
          <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md shadow-2xl relative z-10">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#1E3C8b] mb-8 flex items-center gap-3 italic">
              <span className="w-6 h-[1px] bg-[#1E3C8b]" />
              <Scale size={16} />
              Paso 2: Cantidad entregada
            </h2>

            <div className="space-y-4 px-2">
              <label className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <Hash size={12} /> Kilogramos a despachar
              </label>
              <input
                type="number"
                value={productKg}
                disabled={!canWriteQuantity}
                onChange={(e) => setProductKg(e.target.value)}
                placeholder={canWriteQuantity ? "0.00" : "Selecciona aliado y producto..."}
                className={`w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-5xl font-mono font-black outline-none transition-all ${
                  canWriteQuantity ? 'text-white focus:border-[#1E3C8b] border-[#1E3C8b]/30' : 'text-slate-700 cursor-not-allowed opacity-30'
                }`}
              />
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-4">
          <div className="sticky top-10 bg-[#0d1525] border border-white/10 rounded-[3rem] p-10 shadow-2xl z-0">
            {/* Contenido del resumen... */}
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 border-b border-white/5 pb-6 mb-10 italic">
              Resumen Operativo
            </h3>

            <div className="space-y-8 mb-12">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-widest font-black text-slate-600">Aliado</span>
                <span className="text-xl font-black text-white uppercase italic truncate">
                  {selectedPartner?.name || '---'}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-widest font-black text-slate-600">Peso Total</span>
                <span className="text-5xl font-black font-mono tracking-tighter text-[#1E3C8b]">
                  {Number(productKg || 0).toLocaleString('es-CO')}
                  <span className="text-lg text-slate-500 ml-2">KG</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSubmitting || !canWriteQuantity || !productKg}
              className="w-full py-6 rounded-2xl bg-white text-black hover:bg-[#1E3C8b] hover:text-white transition-all font-black uppercase text-[11px] tracking-[0.4em] disabled:opacity-10 shadow-xl flex items-center justify-center gap-3"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Confirmar Despacho <ArrowRight size={18} /></>}
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        input::-webkit-outer-spin-button, 
        input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        select option { background: #0a1120; color: white; }
      `}</style>
    </div>
  );
}