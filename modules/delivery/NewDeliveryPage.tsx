'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import SearchBarUniversal from '@/components/molecules/SearchBar';
import { PartnerDAO, ProductDAO, DeliveryUnit } from '@/types/Api';
import { createDelivery } from '@/request/delivery';
import { getAllPartners } from '@/request/partner';
import {
  Truck, Package, Users, X, Loader2, ArrowRight,
  Hash, ChevronDown, DollarSign, Weight,
} from 'lucide-react';

// ─── Configuración de unidades ───────────────────────────────────────────────
const UNITS: { value: DeliveryUnit; label: string; icon: string }[] = [
  { value: 'kg',          label: 'Kilogramos',  icon: '⚖️' },
  { value: 'sacos',       label: 'Sacos',       icon: '🧺' },
  { value: 'lonas',       label: 'Lonas',       icon: '🛍️' },
  { value: 'bultos',      label: 'Bultos',      icon: '📦' },
  { value: 'canastillas', label: 'Canastillas', icon: '🪣' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

export default function NewDeliveryPage() {
  const { user } = useAuth();

  const [partners, setPartners]                   = useState<PartnerDAO[]>([]);
  const [selectedProduct, setSelectedProduct]     = useState<ProductDAO | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');

  // Campos principales
  const [unit, setUnit]         = useState<DeliveryUnit>('kg');
  const [quantity, setQuantity] = useState('');
  // Campos opcionales
  const [productKg, setProductKg]       = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');

  const [loadingPartners, setLoadingPartners] = useState(true);
  const [isSubmitting, setIsSubmitting]       = useState(false);

  useEffect(() => {
    getAllPartners()
      .then(setPartners)
      .catch(console.error)
      .finally(() => setLoadingPartners(false));
  }, []);

  const selectedPartner = partners.find(p => p.id === selectedPartnerId);
  const canFillQuantity = !!(selectedProduct && selectedPartnerId);
  const totalPrice      = quantity && pricePerUnit
    ? Number(quantity) * Number(pricePerUnit)
    : null;

  const resetForm = () => {
    setSelectedProduct(null);
    setSelectedPartnerId('');
    setUnit('kg');
    setQuantity('');
    setProductKg('');
    setPricePerUnit('');
  };

  const handleSave = async () => {
    if (!selectedProduct || !selectedPartnerId || !quantity) {
      alert('⚠️ Completa aliado, producto y cantidad');
      return;
    }

    const body: Record<string, unknown> = {
      tenantId:  user?.tenantId,
      partnerId: selectedPartnerId,
      productId: selectedProduct.id,
      quantity:  parseFloat(quantity),
      unit,
    };

    // Solo enviar campos opcionales si tienen valor
    if (productKg && unit !== 'kg')  body.productKg   = parseFloat(productKg);
    if (pricePerUnit)                body.pricePerUnit = parseFloat(pricePerUnit);
    if (totalPrice !== null)         body.totalPrice   = totalPrice;

    try {
      setIsSubmitting(true);
      await createDelivery(body);
      alert('✅ Entrega registrada correctamente');
      resetForm();
    } catch (error: any) {
      alert(error.message || 'Error al registrar entrega');
    } finally {
      setIsSubmitting(false);
    }
  };

  const unitLabel = UNITS.find(u => u.value === unit)?.label ?? 'Unidades';

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 text-slate-200">

      <header className="mb-10 border-b border-white/10 pb-8">
        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
          Nueva Entrega<span className="text-[#1E3C8b]">.</span>
        </h1>
        <p className="mt-2 text-slate-500 uppercase tracking-[0.4em] text-[10px] font-bold">
          Registro operativo de despacho a aliados comerciales
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* ── COLUMNA IZQUIERDA ─────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* PASO 1: ALIADO + PRODUCTO */}
          <section
            className="rounded-[2.5rem] p-8 backdrop-blur-md shadow-2xl relative z-[60]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(30,60,139,0.3)' }}
          >
            <h2
              className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-3"
              style={{ color: 'rgba(74,127,255,0.8)' }}
            >
              <Truck size={14} /> Paso 1 — Configurar entrega
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Aliado */}
              <div className="space-y-3">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest block"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  <Users size={10} className="inline mr-1" /> Aliado receptor
                </label>
                <div className="relative">
                  <select
                    className="w-full rounded-2xl py-3.5 pl-4 pr-10 text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer text-white outline-none transition-all"
                    style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                  >
                    <option value="">-- Seleccionar aliado --</option>
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Producto */}
              <div className="space-y-3 relative">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest block"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  <Package size={10} className="inline mr-1" /> Producto
                </label>
                <SearchBarUniversal
                  searchType="products"
                  placeholder="Buscar producto..."
                  showResults={true}
                  onAddToCart={(item) => setSelectedProduct(item as ProductDAO)}
                />
                {selectedProduct && (
                  <div
                    className="mt-3 flex items-center justify-between p-3 rounded-2xl"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                        <Package size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase">{selectedProduct.name}</p>
                        <p className="text-[9px] text-emerald-400 font-bold uppercase">
                          Stock: {selectedProduct.stock} kg
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedProduct(null)} className="p-1 hover:bg-white/10 rounded-full">
                      <X size={14} className="text-slate-500 hover:text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* PASO 2: UNIDAD + CANTIDAD */}
          <section
            className="rounded-[2.5rem] p-8 backdrop-blur-md shadow-2xl relative z-10"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(30,60,139,0.3)' }}
          >
            <h2
              className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-3"
              style={{ color: 'rgba(74,127,255,0.8)' }}
            >
              <Hash size={14} /> Paso 2 — Unidad y cantidad
            </h2>

            {/* SELECTOR DE UNIDAD */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {UNITS.map((u) => (
                <button
                  key={u.value}
                  onClick={() => { setUnit(u.value); if (u.value === 'kg') setProductKg(''); }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                    unit === u.value
                      ? 'border-[#4a7fff] text-white'
                      : 'border-white/10 text-slate-500 hover:border-white/20'
                  }`}
                  style={unit === u.value ? { background: 'rgba(74,127,255,0.1)' } : { background: 'rgba(255,255,255,0.02)' }}
                >
                  <span className="text-xl">{u.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest leading-tight">
                    {u.label}
                  </span>
                </button>
              ))}
            </div>

            {/* CANTIDAD */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Hash size={12} /> {unitLabel} a despachar
              </label>
              <input
                type="number"
                value={quantity}
                disabled={!canFillQuantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={canFillQuantity ? '0' : 'Selecciona aliado y producto...'}
                className={`w-full rounded-2xl p-6 text-5xl font-mono font-black outline-none transition-all ${
                  canFillQuantity ? 'text-white' : 'text-slate-700 cursor-not-allowed opacity-30'
                }`}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: canFillQuantity ? '1px solid rgba(30,60,139,0.5)' : '1px solid rgba(255,255,255,0.05)',
                }}
              />
            </div>
          </section>

          {/* PASO 3: OPCIONALES */}
          <section
            className="rounded-[2.5rem] p-8 backdrop-blur-md shadow-2xl relative z-10"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(30,60,139,0.15)' }}
          >
            <h2
              className="text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-3"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              Paso 3 — Datos opcionales
            </h2>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.15)' }}>
              Déjalos vacíos si no aplican
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* KG equivalente — solo si la unidad no es kg */}
              {unit !== 'kg' && (
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Weight size={12} /> Equiv. en kg{' '}
                    <span className="text-slate-700 normal-case font-medium">(opcional)</span>
                  </label>
                  <input
                    type="number"
                    value={productKg}
                    onChange={(e) => setProductKg(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-2xl px-5 py-4 text-2xl font-mono font-black text-white outline-none transition-all"
                    style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.25)' }}
                  />
                  <p className="text-[8px] text-slate-700 uppercase tracking-widest font-bold">
                    ¿Cuántos kg equivalen a {quantity || '?'} {unitLabel}?
                  </p>
                </div>
              )}

              {/* Precio por unidad */}
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign size={12} /> Precio × {unit === 'kg' ? 'kg' : unitLabel.toLowerCase()}{' '}
                  <span className="text-slate-700 normal-case font-medium">(opcional)</span>
                </label>
                <input
                  type="number"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-2xl px-5 py-4 text-2xl font-mono font-black text-white outline-none transition-all"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.25)' }}
                />
                {totalPrice !== null && (
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(16,185,129,0.8)' }}>
                    Total: {fmt(totalPrice)}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* ── COLUMNA DERECHA: RESUMEN ────────────────────────────── */}
        <div className="lg:col-span-4">
          <div
            className="sticky top-10 rounded-[3rem] p-10 shadow-2xl"
            style={{ background: 'rgba(13,21,37,0.98)', border: '1px solid rgba(30,60,139,0.3)' }}
          >
            <h3
              className="text-[10px] uppercase tracking-[0.3em] font-black pb-6 mb-8 italic border-b"
              style={{ color: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.05)' }}
            >
              Resumen Operativo
            </h3>

            <div className="space-y-8 mb-10">
              {/* Aliado */}
              <div>
                <span className="text-[9px] uppercase tracking-widest font-black block mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Aliado
                </span>
                <span className="text-lg font-black text-white uppercase italic truncate block">
                  {selectedPartner?.name || '---'}
                </span>
              </div>

              {/* Producto */}
              <div>
                <span className="text-[9px] uppercase tracking-widest font-black block mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Producto
                </span>
                <span className="text-base font-black text-white uppercase italic truncate block">
                  {selectedProduct?.name || '---'}
                </span>
              </div>

              {/* Cantidad principal */}
              <div>
                <span className="text-[9px] uppercase tracking-widest font-black block mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Cantidad
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black font-mono tracking-tighter" style={{ color: '#4a7fff' }}>
                    {Number(quantity || 0).toLocaleString('es-CO')}
                  </span>
                  <span className="text-sm font-black uppercase" style={{ color: 'rgba(74,127,255,0.6)' }}>
                    {unitLabel}
                  </span>
                </div>
              </div>

              {/* KG equivalente */}
              {unit !== 'kg' && productKg && (
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-black block mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Equiv. KG
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-slate-400">
                      {Number(productKg).toLocaleString('es-CO')}
                    </span>
                    <span className="text-xs font-black uppercase text-slate-600">kg</span>
                  </div>
                </div>
              )}

              {/* Precio total */}
              {totalPrice !== null && (
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-black block mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Valor Total
                  </span>
                  <span className="text-xl font-black font-mono" style={{ color: 'rgba(16,185,129,0.9)' }}>
                    {fmt(totalPrice)}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={isSubmitting || !canFillQuantity || !quantity}
              className="w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 transition-all disabled:opacity-20 active:scale-95 text-white"
              style={{ background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)' }}
            >
              {isSubmitting
                ? <Loader2 className="animate-spin" size={18} />
                : <>Confirmar Despacho <ArrowRight size={18} /></>
              }
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
