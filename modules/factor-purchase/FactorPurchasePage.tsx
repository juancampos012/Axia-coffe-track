'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBalance } from '@/context/BalanceContext';
import SearchBarUniversal from '@/components/molecules/SearchBar';
import { ProductDAO, ClientDAO, FactorPurchaseItem } from '@/types/Api';
import { crearFacturaVenta } from '@/lib/api-saleInvoce';
import { generateFactorLiquidacion } from './FactorLiquidacionPDF';
import { getCompanyById } from '@/request/companies';
import {
  TrendingDown, Package, UserCheck, X, Loader2, ArrowRight,
  Plus, Trash2, Calculator, CheckCircle, Receipt,
} from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const round2 = (n: number) => Math.round(n * 100) / 100;

interface CartItem extends FactorPurchaseItem {
  cartId: number;
}

let cartIdCounter = 0;

export default function FactorPurchasePage() {
  const { user } = useAuth();
  const { refreshBalance } = useBalance();

  // Cliente (productor al que le compramos)
  const [selectedClient, setSelectedClient] = useState<ClientDAO | null>(null);

  // Factor global
  const [factor, setFactor] = useState<string>('1');

  // Producto en staging
  const [stagingProduct, setStagingProduct]   = useState<ProductDAO | null>(null);
  const [stagingQuantity, setStagingQuantity] = useState<string>('');

  // Carrito
  const [cart, setCart] = useState<CartItem[]>([]);

  // Datos empresa (para PDF)
  const [company, setCompany] = useState<{ name?: string; address?: string; nit?: string; phone?: string } | undefined>();

  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess]           = useState(false);
  const [pdfUrl, setPdfUrl]             = useState<string | null>(null);

  // Cargar empresa al montar
  useEffect(() => {
    if (!user?.tenantId) return;
    getCompanyById(user.tenantId)
      .then(c => setCompany({ name: c.name, address: c.address, nit: c.nit, phone: c.phone }))
      .catch(() => {});
  }, [user?.tenantId]);

  // ── Cálculos derivados ───────────────────────────────────────────────────
  const factorNum      = parseFloat(factor) || 0;
  const basePriceNum   = stagingProduct ? (stagingProduct.purchasePrice ?? 0) : 0;
  const unitPrice      = stagingProduct ? round2(basePriceNum * factorNum) : 0;
  const stagingSubtotal = stagingQuantity ? round2(unitPrice * parseFloat(stagingQuantity)) : 0;
  const totalPrice     = cart.reduce((s, item) => s + item.subtotal, 0);

  // ── Agregar al carrito ───────────────────────────────────────────────────
  const addToCart = () => {
    if (!stagingProduct || !stagingQuantity || parseFloat(stagingQuantity) <= 0) {
      alert('Ingresa producto y cantidad válida');
      return;
    }
    const item: CartItem = {
      cartId:      ++cartIdCounter,
      productId:   stagingProduct.id,
      productName: stagingProduct.name,
      tenantId:    user?.tenantId ?? '',
      basePrice:   basePriceNum,
      factor:      factorNum,
      unitPrice,
      quantity:    parseFloat(stagingQuantity),
      unit:        'kg', // Unidad fijada en kg
      subtotal:    stagingSubtotal,
    };
    setCart(prev => [...prev, item]);
    setStagingProduct(null);
    setStagingQuantity('');
  };

  const removeFromCart = (cartId: number) =>
    setCart(prev => prev.filter(i => i.cartId !== cartId));

  // ── Enviar como factura de venta ─────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedClient) { alert('Selecciona un cliente'); return; }
    if (cart.length === 0)  { alert('Agrega al menos un producto'); return; }
    if (factorNum <= 0)     { alert('El factor debe ser mayor a 0'); return; }

    try {
      setIsSubmitting(true);

      // Crear factura de venta (igual que ScreenMakeSale)
      await crearFacturaVenta({
        clientId:     selectedClient.id,
        totalPrice,
        tenantId:     user?.tenantId ?? '',
        electronicBill: false,
        products: cart.map(item => ({
          productId:    item.productId,
          quantity:     item.quantity,
          unitPrice:    item.unitPrice,
          tenantId:     item.tenantId,
          announcementId: null,
        })),
      });

      // Actualizar balance global sin recargar la página
      if (user?.tenantId) await refreshBalance(user.tenantId);

      // Generar liquidación carta
      const blob = generateFactorLiquidacion({
        receiptNumber: String(Date.now()).slice(-6),
        date:          new Date().toISOString(),
        clientName:    `${selectedClient.firstName} ${selectedClient.lastName}`,
        clientPhone:   selectedClient.phone ?? undefined,
        factor:        factorNum,
        items: cart.map(item => ({
          productName: item.productName,
          quantity:    item.quantity,
          basePrice:   item.basePrice,
          factor:      item.factor,
          unitPrice:   item.unitPrice,
          subtotal:    item.subtotal,
        })),
        totalPrice,
        company,
      });

      setPdfUrl(URL.createObjectURL(blob));
      setSuccess(true);
      setCart([]);
      setSelectedClient(null);
      setFactor('1');
    } catch (err: any) {
      alert(err.message || 'Error al registrar la factura');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Pantalla de éxito ────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center animate-in fade-in zoom-in px-4 py-20">
        <div
          className="max-w-md w-full rounded-[3rem] p-10 text-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(16,185,129,0.15)' }}
          >
            <CheckCircle size={40} style={{ color: '#10b981' }} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
            ¡Factura registrada!
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Compra por factor procesada · aparece en libro de ventas
          </p>

          <div className="flex flex-col gap-3">
            {pdfUrl && (
              <button
                onClick={() => window.open(pdfUrl)}
                className="w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 text-black"
                style={{ background: '#ffffff' }}
              >
                <Receipt size={16} /> Ver Factura
              </button>
            )}
            <button
              onClick={() => { setSuccess(false); setPdfUrl(null); }}
              className="w-full py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            >
              Nueva compra por factor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 text-slate-200">

      {/* HEADER */}
      <header className="mb-10 border-b border-white/10 pb-8">
        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
          <Calculator size={30} style={{ color: '#4a7fff' }} />
          Compra por Factor<span style={{ color: '#4a7fff' }}>.</span>
        </h1>
        <p className="mt-2 text-slate-500 uppercase tracking-[0.4em] text-[10px] font-bold">
          Precio final = precio base × factor · compra al cliente productor
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* ── COLUMNA IZQUIERDA ──────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* PASO 1: CLIENTE + FACTOR */}
          <section
            className="rounded-[2.5rem] p-8 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(30,60,139,0.3)' }}
          >
            <h2
              className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-3"
              style={{ color: 'rgba(74,127,255,0.8)' }}
            >
              <UserCheck size={14} /> Paso 1 — Cliente y factor
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Cliente */}
              <div className="space-y-3">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest block"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  Cliente (productor)
                </label>
                <div className="relative z-50">
                  <SearchBarUniversal
                    searchType="clients"
                    placeholder="Buscar cliente..."
                    showResults={true}
                    onAddToCart={(item) => setSelectedClient(item as ClientDAO)}
                  />
                </div>
                {selectedClient ? (
                  <div
                    className="flex items-center justify-between p-3 rounded-2xl"
                    style={{ background: 'rgba(74,127,255,0.08)', border: '1px solid rgba(74,127,255,0.2)' }}
                  >
                    <span className="text-sm font-black text-white uppercase">
                      {selectedClient.firstName} {selectedClient.lastName}
                    </span>
                    <button onClick={() => setSelectedClient(null)}>
                      <X size={14} className="text-slate-500 hover:text-red-400" />
                    </button>
                  </div>
                ) : (
                  <div className="h-[46px] hidden md:block" /> 
                )}
              </div>

              {/* Factor */}
              <div className="space-y-3">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest block"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  Factor de precio
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="2"
                  value={factor}
                  onChange={(e) => setFactor(e.target.value)}
                  className="w-full rounded-2xl p-5 text-4xl font-mono font-black text-white outline-none transition-all"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.4)' }}
                />
                <div className="flex items-center gap-3">
                  {[0.80, 0.85, 0.90, 0.92, 0.95, 1.00].map(f => (
                    <button
                      key={f}
                      onClick={() => setFactor(String(f))}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                        parseFloat(factor) === f ? 'text-white' : 'text-slate-600 hover:text-slate-400'
                      }`}
                      style={{
                        background: parseFloat(factor) === f ? 'rgba(74,127,255,0.2)' : 'rgba(255,255,255,0.03)',
                        border: parseFloat(factor) === f ? '1px solid rgba(74,127,255,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {factorNum < 1 ? `Descuento del ${Math.round((1 - factorNum) * 100)}%` :
                   factorNum > 1 ? `Incremento del ${Math.round((factorNum - 1) * 100)}%` :
                   'Sin ajuste (precio base)'}
                </p>
              </div>
            </div>
          </section>

          {/* PASO 2: AGREGAR PRODUCTOS */}
          <section
            className="rounded-[2.5rem] p-8 shadow-2xl relative z-10"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(30,60,139,0.3)' }}
          >
            <h2
              className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-3"
              style={{ color: 'rgba(74,127,255,0.8)' }}
            >
              <Package size={14} /> Paso 2 — Agregar productos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 items-start">
              {/* Buscar producto */}
              <div className="space-y-3 relative z-40">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest block"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  Producto
                </label>
                <SearchBarUniversal
                  searchType="products"
                  placeholder="Buscar producto..."
                  showResults={true}
                  onAddToCart={(item) => setStagingProduct(item as ProductDAO)}
                />
                {stagingProduct && (
                  <div
                    className="p-4 rounded-2xl space-y-2"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(30,60,139,0.25)' }}
                  >
                    <p className="text-sm font-black text-white uppercase">{stagingProduct.name}</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[8px] text-slate-600 uppercase font-bold">Precio base</p>
                        <p className="text-xs font-mono font-black text-slate-400">
                          {fmt(basePriceNum)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-600 uppercase font-bold">× Factor</p>
                        <p className="text-xs font-mono font-black" style={{ color: '#4a7fff' }}>
                          {factorNum}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-600 uppercase font-bold">= Precio final</p>
                        <p className="text-xs font-mono font-black text-emerald-400">
                          {fmt(unitPrice)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setStagingProduct(null)}
                      className="text-[8px] text-slate-600 hover:text-red-400 uppercase tracking-widest font-bold flex items-center gap-1 transition-colors"
                    >
                      <X size={10} /> Cambiar producto
                    </button>
                  </div>
                )}
              </div>

              {/* Precio Base e Indicador Estático KG */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="text-[10px] font-bold uppercase tracking-widest block mb-3"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      Precio Base
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={stagingProduct ? fmt(basePriceNum) : '---'}
                      className="w-full rounded-2xl px-4 py-3 text-xs font-mono font-black text-slate-400 outline-none text-center select-none"
                      style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)' }}
                    />
                  </div>
                  <div>
                    <label
                      className="text-[10px] font-bold uppercase tracking-widest block mb-3"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      Unidad
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="KG"
                      className="w-full rounded-2xl px-4 py-3 text-xs font-black tracking-widest text-white/50 text-center outline-none select-none"
                      style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)' }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="text-[10px] font-bold uppercase tracking-widest block mb-2"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    Cantidad
                  </label>
                  <input
                    type="number"
                    value={stagingQuantity}
                    onChange={(e) => setStagingQuantity(e.target.value)}
                    placeholder="0"
                    disabled={!stagingProduct}
                    className={`w-full rounded-2xl px-5 py-4 text-3xl font-mono font-black outline-none transition-all ${
                      stagingProduct ? 'text-white' : 'text-slate-700 opacity-30 cursor-not-allowed'
                    }`}
                    style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(30,60,139,0.3)' }}
                  />
                </div>

                {stagingQuantity && stagingProduct && stagingSubtotal > 0 && (
                  <div
                    className="flex items-center justify-between px-4 py-2 rounded-xl"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Subtotal</span>
                    <span className="text-sm font-black font-mono" style={{ color: '#10b981' }}>
                      {fmt(stagingSubtotal)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={addToCart}
              disabled={!stagingProduct || !stagingQuantity}
              className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-20 text-white"
              style={{ background: 'rgba(74,127,255,0.15)', border: '1px solid rgba(74,127,255,0.3)' }}
            >
              <Plus size={16} /> Agregar al carrito
            </button>
          </section>

          {/* PASO 3: CARRITO */}
          {cart.length > 0 && (
            <section
              className="rounded-[2.5rem] p-8 shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(30,60,139,0.2)' }}
            >
              <h2
                className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-3"
                style={{ color: 'rgba(74,127,255,0.8)' }}
              >
                <TrendingDown size={14} /> Paso 3 — Carrito ({cart.length} producto{cart.length > 1 ? 's' : ''})
              </h2>

              <div className="space-y-3">
                <div
                  className="grid grid-cols-12 px-4 py-2 text-[8px] font-black uppercase tracking-widest"
                  style={{ color: 'rgba(74,127,255,0.6)' }}
                >
                  <span className="col-span-4">Producto</span>
                  <span className="col-span-2 text-right">P.Base</span>
                  <span className="col-span-1 text-right">×F</span>
                  <span className="col-span-2 text-right">P.Final</span>
                  <span className="col-span-2 text-right">Subtotal</span>
                  <span className="col-span-1" />
                </div>

                {cart.map((item) => (
                  <div
                    key={item.cartId}
                    className="grid grid-cols-12 items-center px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(30,60,139,0.15)' }}
                  >
                    <div className="col-span-4">
                      <p className="text-sm font-black text-white uppercase leading-tight">{item.productName}</p>
                      <p className="text-[9px] font-bold uppercase" style={{ color: 'rgba(74,127,255,0.6)' }}>
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-xs font-mono text-slate-500">{fmt(item.basePrice)}</span>
                    </div>
                    <div className="col-span-1 text-right">
                      <span className="text-xs font-mono" style={{ color: 'rgba(74,127,255,0.7)' }}>{item.factor}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-xs font-mono text-white font-black">{fmt(item.unitPrice)}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-sm font-black font-mono" style={{ color: '#10b981' }}>
                        {fmt(item.subtotal)}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}

                <div
                  className="flex items-center justify-between px-4 py-4 rounded-2xl mt-2"
                  style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(16,185,129,0.7)' }}>
                    Total a pagar al cliente
                  </span>
                  <span className="text-2xl font-black font-mono" style={{ color: '#10b981' }}>
                    {fmt(totalPrice)}
                  </span>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ── COLUMNA DERECHA: RESUMEN ─────────────────────────────── */}
        <div className="lg:col-span-4">
          <div
            className="sticky top-10 rounded-[3rem] p-10 shadow-2xl"
            style={{ background: 'rgba(13,21,37,0.98)', border: '1px solid rgba(30,60,139,0.3)' }}
          >
            <h3
              className="text-[10px] uppercase tracking-[0.3em] font-black pb-6 mb-8 italic border-b"
              style={{ color: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.05)' }}
            >
              Resumen de Compra
            </h3>

            <div className="space-y-6 mb-10">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-black block mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Cliente (productor)
                </span>
                <span className="text-base font-black text-white uppercase italic truncate block">
                  {selectedClient
                    ? `${selectedClient.firstName} ${selectedClient.lastName}`
                    : '---'}
                </span>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-widest font-black block mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Factor aplicado
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black font-mono" style={{ color: '#4a7fff' }}>
                    {factorNum}
                  </span>
                  {factorNum !== 1 && (
                    <span className="text-sm font-black" style={{ color: factorNum < 1 ? '#f87171' : '#10b981' }}>
                      ({factorNum < 1 ? '-' : '+'}{Math.abs(Math.round((factorNum - 1) * 100))}%)
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-widest font-black block mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Productos
                </span>
                <span className="text-3xl font-black font-mono text-white">{cart.length}</span>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-widest font-black block mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Total a pagar
                </span>
                <span className="text-2xl font-black font-mono" style={{ color: '#10b981' }}>
                  {fmt(totalPrice)}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedClient || cart.length === 0}
              className="w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 transition-all disabled:opacity-20 active:scale-95 text-white"
              style={{ background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)' }}
            >
              {isSubmitting
                ? <Loader2 className="animate-spin" size={18} />
                : <>Registrar Factura <ArrowRight size={18} /></>
              }
            </button>

            <p className="text-[8px] text-center mt-4 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>
              Aparece en el libro de ventas · actualiza stock y balance
            </p>
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