'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBalance } from '@/context/BalanceContext';
import SearchBarUniversal from '@/components/molecules/SearchBar';
import { ClientDAO, ProductDAO } from '@/types/Api';
import { generateFactorLiquidacion } from './FactorLiquidacionPDF';
import { getCompanyById } from '@/request/companies';
import { getListproductsByName } from '@/lib/api-products';
import { crearCompraFactor } from '@/lib/api-purchase';
import {
  UserCheck, X, Loader2, ArrowRight,
  Calculator, CheckCircle, Receipt, FlaskConical, Scale,
} from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const round4 = (n: number) => Math.round(n * 10000) / 10000;
const round2 = (n: number) => Math.round(n * 100) / 100;

const BASE_FACTOR = 94;

// Formatea con puntos cada 3 dígitos (1234567 → "1.234.567")
const addDots = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
// Quita los puntos para guardar el valor limpio
const stripDots = (v: string) => v.replace(/\./g, '');

export default function FactorPurchasePage() {
  const { user } = useAuth();
  const { refreshBalance } = useBalance();

  // Cliente (productor)
  const [selectedClient, setSelectedClient] = useState<ClientDAO | null>(null);

  // Producto que se está comprando: siempre Café seco/pergamino, resuelto automáticamente
  const [selectedProduct, setSelectedProduct] = useState<ProductDAO | null>(null);
  const [productError, setProductError] = useState(false);

  // Modo de ingreso del factor
  const [factorMode, setFactorMode] = useState<'auto' | 'manual'>('auto');

  // Datos de muestra (modo auto)
  const [cantidadMuestra, setCantidadMuestra] = useState('');
  const [gramosExcelso,   setGramosExcelso]   = useState('');

  // Campos comunes
  const [precioBase,      setPrecioBase]       = useState('');
  const [factorOverride,  setFactorOverride]   = useState(''); // factor directo (modo manual)

  // Cantidad total de café a comprar
  const [totalKg, setTotalKg] = useState('');

  // Empresa para PDF
  const [company, setCompany] = useState<{ name?: string; address?: string; nit?: string; phone?: string } | undefined>();

  // Estado envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [pdfUrl,       setPdfUrl]       = useState<string | null>(null);

  useEffect(() => {
    if (!user?.tenantId) return;
    getCompanyById(user.tenantId)
      .then(c => setCompany({ name: c.name, address: c.address, nit: c.nit, phone: c.phone }))
      .catch(() => {});
  }, [user?.tenantId]);

  // Resolver automáticamente el producto "Café seco" del tenant (aquí siempre se compra ese)
  useEffect(() => {
    if (!user?.tenantId) return;
    getListproductsByName('cafe')
      .then((products) => {
        // El backend ya filtra por tenant; solo hace falta descartar "Cafe Mojado"
        const match = (products || []).find(
          (p) => p.name.toLowerCase().includes('cafe') && !p.name.toLowerCase().includes('mojado')
        );
        if (match) setSelectedProduct(match);
        else setProductError(true);
      })
      .catch(() => setProductError(true));
  }, [user?.tenantId]);

  // ── Cálculos ─────────────────────────────────────────────────────────────
  const muestraNum  = parseFloat(cantidadMuestra) || 0;
  const excelsoNum  = parseFloat(gramosExcelso)   || 0;
  const baseNum     = parseFloat(precioBase)       || 0;
  const kgNum       = parseFloat(totalKg)          || 0;

  // Factor según modo
  const factorCalculado   = excelsoNum > 0 ? round2((70 * muestraNum) / excelsoNum) : 0;
  const factorManualNum   = parseFloat(factorOverride) || 0;
  const factorNum         = factorMode === 'manual' ? factorManualNum : factorCalculado;

  // Precio carga = (94 / factor) × precio_base
  const precioCarga = factorNum > 0 ? round2((BASE_FACTOR / factorNum) * baseNum) : 0;
  // Precio kg = precio_carga / 125
  const precioKg    = round2(precioCarga / 125);
  // Total a pagar
  const totalPagar  = round2(precioKg * kgNum);

  const formulaOk = factorNum > 0 && precioKg > 0;
  const canSubmit = !!selectedClient && !!selectedProduct && formulaOk && kgNum > 0;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmit || !selectedClient || !selectedProduct || !user?.tenantId) return;
    try {
      setIsSubmitting(true);

      // Registrar la compra en el backend (stock, balance y factura real)
      const invoice = await crearCompraFactor({
        tenantId:   user.tenantId,
        clientId:   selectedClient.id,
        factor:     factorNum,
        totalPrice: totalPagar,
        products: [{
          productId:   selectedProduct.id,
          productName: selectedProduct.name,
          tenantId:    selectedProduct.tenantId,
          basePrice:   baseNum,
          factor:      factorNum,
          unitPrice:   precioKg,
          quantity:    kgNum,
          unit:        'kg',
          subtotal:    totalPagar,
        }],
      });

      // Actualizar balance global
      await refreshBalance(user.tenantId);

      const blob = generateFactorLiquidacion({
        receiptNumber:   String(invoice?.folio ?? '—'),
        date:            new Date().toISOString(),
        clientName:      `${selectedClient.firstName} ${selectedClient.lastName}`,
        clientPhone:     selectedClient.phone ?? undefined,
        factor:          factorNum,
        cantidadMuestra: factorMode === 'auto' ? muestraNum : undefined,
        gramosExcelso:   factorMode === 'auto' ? excelsoNum : undefined,
        precioBase:      baseNum,
        precioCarga,
        precioKg,
        items: [{
          productName: selectedProduct.name,
          quantity:    kgNum,
          basePrice:   baseNum,
          factor:      factorNum,
          unitPrice:   precioKg,
          subtotal:    totalPagar,
        }],
        totalPrice: totalPagar,
        company,
      });

      setPdfUrl(URL.createObjectURL(blob));
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Error al generar la liquidación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(false); setPdfUrl(null);
    setSelectedClient(null);
    setSelectedProduct(null);
    setFactorMode('auto');
    setCantidadMuestra(''); setGramosExcelso('');
    setPrecioBase(''); setTotalKg(''); setFactorOverride('');
  };

  // ── Pantalla éxito ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div
          className="max-w-md w-full rounded-[3rem] p-10 text-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(16,185,129,0.15)' }}>
            <CheckCircle size={40} style={{ color: '#10b981' }} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            ¡Liquidación generada!
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-8"
            style={{ color: 'rgba(255,255,255,0.35)' }}>
            {selectedClient?.firstName} {selectedClient?.lastName} · {kgNum} kg · {fmt(totalPagar)}
          </p>
          <div className="flex flex-col gap-3">
            {pdfUrl && (
              <button onClick={() => window.open(pdfUrl)}
                className="w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 text-black"
                style={{ background: '#ffffff' }}>
                <Receipt size={16} /> Ver Liquidación
              </button>
            )}
            <button onClick={handleReset}
              className="w-full py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              Nueva compra
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulario ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 text-slate-200">

      {/* HEADER */}
      <header className="mb-10 border-b border-white/10 pb-8">
        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
          <Calculator size={30} style={{ color: '#4a7fff' }} />
          Compra cafe por Factor<span style={{ color: '#4a7fff' }}>.</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* ── COLUMNA PRINCIPAL ─────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* PASO 1 — CLIENTE */}
          <section className="rounded-[2.5rem] p-8 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(30,60,139,0.3)' }}>
            <h2 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-3"
              style={{ color: 'rgba(74,127,255,0.8)' }}>
              <UserCheck size={14} /> Paso 1 — Productor
            </h2>
            <div className="relative z-50">
              <SearchBarUniversal
                searchType="clients"
                placeholder="Buscar productor / cliente..."
                showResults={true}
                onAddToCart={(item) => setSelectedClient(item as ClientDAO)}
              />
            </div>

            {productError && (
              <div className="mt-4 p-3 rounded-xl text-[9px] font-bold uppercase tracking-widest text-center"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.7)' }}>
                No se encontró el producto "Cafe Seco" en el inventario. Créalo primero en Productos.
              </div>
            )}
          </section>

          {/* PASO 2 — FACTOR */}
          <section className="rounded-[2.5rem] p-8 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(30,60,139,0.3)' }}>
            <h2 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-3"
              style={{ color: 'rgba(74,127,255,0.8)' }}>
              <FlaskConical size={14} /> Paso 2 — Factor de rendimiento
            </h2>

            {/* Toggle automático / manual */}
            <div className="flex items-center gap-0 mb-8 p-1 rounded-2xl w-fit"
              style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(30,60,139,0.3)' }}>
              <button
                type="button"
                onClick={() => { setFactorMode('auto'); setFactorOverride(''); }}
                className="relative px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                style={{
                  background: factorMode === 'auto' ? 'rgba(74,127,255,0.25)' : 'transparent',
                  color: factorMode === 'auto' ? '#4a7fff' : 'rgba(255,255,255,0.3)',
                  border: factorMode === 'auto' ? '1px solid rgba(74,127,255,0.4)' : '1px solid transparent',
                }}
              >
                Automático
              </button>
              <button
                type="button"
                onClick={() => { setFactorMode('manual'); setCantidadMuestra(''); setGramosExcelso(''); }}
                className="px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                style={{
                  background: factorMode === 'manual' ? 'rgba(245,158,11,0.2)' : 'transparent',
                  color: factorMode === 'manual' ? '#f59e0b' : 'rgba(255,255,255,0.3)',
                  border: factorMode === 'manual' ? '1px solid rgba(245,158,11,0.35)' : '1px solid transparent',
                }}
              >
                Directo
              </button>
            </div>

            {/* ── MODO AUTOMÁTICO: muestra + excelso + precio base ── */}
            {factorMode === 'auto' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Cantidad muestra */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest block"
                      style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Cantidad muestra (g)
                    </label>
                    <input
                      type="text" inputMode="numeric"
                      value={addDots(cantidadMuestra)}
                      onChange={e => setCantidadMuestra(stripDots(e.target.value))}
                      placeholder="0"
                      className="w-full rounded-2xl px-5 py-4 text-3xl font-mono font-black text-white outline-none transition-all"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                    />
                  </div>

                  {/* Gramos excelso */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest block"
                      style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Gramos de excelso (g)
                    </label>
                    <input
                      type="number" step="0.01" min="0"
                      value={gramosExcelso}
                      onChange={e => setGramosExcelso(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-2xl px-5 py-4 text-3xl font-mono font-black text-white outline-none transition-all"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                    />
                  </div>

                  {/* Precio base */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest block"
                      style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Precio base (COP)
                    </label>
                    <input
                      type="text" inputMode="numeric"
                      value={addDots(precioBase)}
                      onChange={e => setPrecioBase(stripDots(e.target.value))}
                      placeholder="0"
                      className="w-full rounded-2xl px-5 py-4 text-3xl font-mono font-black text-white outline-none transition-all"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                    />
                  </div>
                </div>

                {/* Factor calculado — display */}
                {factorCalculado > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 rounded-2xl px-5 py-4"
                      style={{ background: 'rgba(74,127,255,0.07)', border: '1px solid rgba(74,127,255,0.2)' }}>
                      <p className="text-[8px] font-black uppercase tracking-widest mb-1"
                        style={{ color: 'rgba(74,127,255,0.6)' }}>
                        Factor calculado
                      </p>
                      <p className="text-4xl font-black font-mono" style={{ color: '#4a7fff' }}>
                        {factorCalculado.toFixed(2)}
                      </p>
                      <p className="text-[7px] font-mono mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        (70 × {muestraNum}) / {excelsoNum} = {factorCalculado.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── MODO DIRECTO: factor + precio base ── */}
            {factorMode === 'manual' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Factor directo */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest block"
                    style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Factor de rendimiento
                  </label>
                  <input
                    type="number" step="0.01" min="0"
                    value={factorOverride}
                    onChange={e => setFactorOverride(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-2xl px-5 py-4 text-4xl font-mono font-black outline-none transition-all"
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(245,158,11,0.45)',
                      color: '#f59e0b',
                    }}
                  />
                </div>

                {/* Precio base */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest block"
                    style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Precio base (COP)
                  </label>
                  <input
                    type="text" inputMode="numeric"
                    value={addDots(precioBase)}
                    onChange={e => setPrecioBase(stripDots(e.target.value))}
                    placeholder="0"
                    className="w-full rounded-2xl px-5 py-4 text-3xl font-mono font-black text-white outline-none transition-all"
                    style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                  />
                </div>
              </div>
            )}
          </section>

          {/* PASO 3 — CANTIDAD */}
          <section className="rounded-[2.5rem] p-8 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(30,60,139,0.3)' }}>
            <h2 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-3"
              style={{ color: 'rgba(74,127,255,0.8)' }}>
              <Scale size={14} /> Paso 3 — Cantidad de café
            </h2>

            {!formulaOk && (
              <div className="mb-4 p-3 rounded-xl text-[9px] font-bold uppercase tracking-widest text-center"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'rgba(245,158,11,0.7)' }}>
                Completa los datos de muestra y precio base primero
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest block mb-2"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Total kg a comprar
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={addDots(totalKg)}
                  onChange={e => setTotalKg(stripDots(e.target.value))}
                  placeholder="0"
                  disabled={!formulaOk}
                  className={`w-full rounded-2xl px-5 py-4 text-3xl font-mono font-black outline-none transition-all ${
                    formulaOk ? 'text-white' : 'text-slate-700 opacity-30 cursor-not-allowed'
                  }`}
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                />
                <p className="text-[8px] mt-1.5 uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.15)' }}>
                  Unidad: kilogramos (kg)
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* ── RESUMEN ──────────────────────────────────────────────── */}
        <div className="lg:col-span-4">
          <div className="sticky top-10 rounded-[3rem] p-8 shadow-2xl"
            style={{ background: 'rgba(13,21,37,0.98)', border: '1px solid rgba(30,60,139,0.3)' }}>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black pb-6 mb-8 italic border-b"
              style={{ color: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.05)' }}>
              Resumen de Compra
            </h3>

            <div className="space-y-6 mb-10">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-black block mb-1"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>Productor</span>
                <span className="text-base font-black text-white uppercase italic truncate block">
                  {selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : '---'}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest font-black block mb-1"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Factor {factorMode === 'auto' ? 'calculado' : 'directo'}
                </span>
                <span className="text-5xl font-black font-mono"
                  style={{ color: factorNum > 0 ? (factorMode === 'auto' ? '#4a7fff' : '#f59e0b') : 'rgba(255,255,255,0.1)' }}>
                  {factorNum > 0 ? factorNum.toFixed(2) : '---'}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest font-black block mb-1"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>Precio / kg</span>
                <span className="text-3xl font-black font-mono"
                  style={{ color: precioKg > 0 ? '#f59e0b' : 'rgba(255,255,255,0.1)' }}>
                  {precioKg > 0 ? fmt(precioKg) : '---'}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest font-black block mb-1"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>Precio / carga</span>
                <span className="text-2xl font-black font-mono"
                  style={{ color: precioCarga > 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)' }}>
                  {precioCarga > 0 ? fmt(precioCarga) : '---'}
                </span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                <span className="text-[9px] uppercase tracking-widest font-black block mb-1"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>Total a pagar</span>
                <span className="text-3xl font-black font-mono"
                  style={{ color: totalPagar > 0 ? '#10b981' : 'rgba(255,255,255,0.1)' }}>
                  {totalPagar > 0 ? fmt(totalPagar) : '---'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit}
              className="w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 transition-all disabled:opacity-20 active:scale-95 text-white"
              style={{ background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)' }}
            >
              {isSubmitting
                ? <Loader2 className="animate-spin" size={18} />
                : <>Crear Compra <ArrowRight size={18} /></>
              }
            </button>
          </div>
        </div>

      </div>

      <style jsx>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}
