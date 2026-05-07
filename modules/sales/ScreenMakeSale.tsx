'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useBalance } from '@/context/BalanceContext';

import { ClientDAO, SaleItem } from '@/types/Api';
import { createPayment } from '@/lib/api-sales';
import { crearFacturaVenta } from '@/lib/api-saleInvoce';
import SearchBarUniversal from '@/components/molecules/SearchBar';
import InvoicePDFGenerator from "./InvoicePDFGenerator";
import { User, Package, Scale, DollarSign, ShoppingCart, X, CheckCircle2, Receipt, Trash2, Loader2 } from 'lucide-react';

export default function ScreenMakeSale() {
  const t = useTranslations("makeSale");
  const { user, loading, initialized } = useAuth();
  const { balance, setBalance } = useBalance();

  const [selectedProductId, setSelectedProductId] = useState('');
  const [tenantIdProduct, setTenantIdProduct] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [quantity, setQuantity] = useState('');
  const [nextId, setNextId] = useState(1);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(0);
  const [name, setName] = useState('');
  const [tax, setTax] = useState(0);
  const [selectedClient, setSelectedClient] = useState<ClientDAO | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [saleCompleted, setSaleCompleted] = useState(false);

  const [clientAnnouncements, setClientAnnouncements] = useState<any[]>([]);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedClient) {
      setClientAnnouncements([]);
      setSelectedAnnouncementId(null);
    }
  }, [selectedClient]);

  if (!initialized || loading) return (
    <div className="min-h-screen bg-[#0a1120] flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-t-2 border-[#1E3C8b] rounded-full"></div>
    </div>
  );

  const resetSaleForm = () => {
    setItems([]); setName(''); setQuantity(''); setPrice('');
    setStock(0); setTax(0); setSelectedProductId(''); setSelectedClient(null);
    setClientAnnouncements([]); setSelectedAnnouncementId(null);
    setNextId(1); setPdfUrl(null); setSaleCompleted(false);
  };

  const handleAddItem = () => {
    const priceValue = parseFloat(price);
    const qtyValue = parseFloat(quantity);
    
    if (!selectedProductId) {
      alert("Error: Este producto no tiene un ID válido.");
      return;
    }

    if (!name || isNaN(priceValue) || priceValue <= 0 || qtyValue <= 0) return;

    if (selectedAnnouncementId) {
      const ann = clientAnnouncements.find(a => a.id === selectedAnnouncementId);
      if (qtyValue > parseFloat(ann.remantQuantity)) {
        alert(`⚠️ Saldo insuficiente en contrato.`);
        return;
      }
    }
    
    const newItem: SaleItem = {
      id: nextId,
      tenantId: tenantIdProduct,
      productId: selectedProductId, 
      name: selectedAnnouncementId ? `[CONTRATO] ${name}` : name,
      quantity: qtyValue,
      stock,
      price: priceValue * (1 + tax / 100),
      basePrice: priceValue,
      tax,
      // @ts-ignore
      announcementId: selectedAnnouncementId 
    };
    
    setItems([...items, newItem]);
    setNextId(nextId + 1);
    setQuantity('');
    if (!selectedAnnouncementId) { 
        setName(''); 
        setPrice(''); 
        setSelectedProductId(''); 
    }
  };

  const calculateSubtotal = () => items.reduce((total, item) => total + item.quantity * item.basePrice, 0);
  const calculateTaxTotal = () => items.reduce((total, item) => total + (item.price - item.basePrice) * item.quantity, 0);
  const calculateTotal = () => items.reduce((total, item) => total + item.quantity * item.price, 0);

  const formatCurrency = (value: number) => 
    Number(value).toLocaleString('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    });

  const handleCompleteSale = async () => {
    if (items.length === 0 || !selectedClient || !user) return;
    setIsProcessing(true);
    try {
      const productsForAPI = items.map(item => ({
        tenantId: user.tenantId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        announcementId: (item as any).announcementId || null
      }));

      const invoiceResponse = await crearFacturaVenta({
        clientId: selectedClient.id,
        totalPrice: calculateTotal(),
        tenantId: user.tenantId,
        electronicBill: false,
        products: productsForAPI
      });

      await createPayment({
        tenantId: user.tenantId,
        amount: calculateTotal(),
        paymentMethod: 'CASH',
        reference: `PAY-${Date.now()}`,
        invoiceId: invoiceResponse.id
      });

      if (balance !== null) setBalance(balance - calculateTotal());

      const pdfBlob = await InvoicePDFGenerator.generatePDF({
        items, subtotal: calculateSubtotal(), taxTotal: calculateTaxTotal(), total: calculateTotal(),
        client: selectedClient, user, t
      });

      setPdfUrl(URL.createObjectURL(pdfBlob));
      setSaleCompleted(true);
    } catch (error) {
      alert("Error al procesar la venta.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden p-4 md:p-6 text-slate-200 bg-[#0a1120] flex flex-col font-sans">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col h-full overflow-hidden">

        {/* HEADER DE TERMINAL (FIJO) */}
        <div className="mb-4 flex justify-between items-end shrink-0 px-2">
          <div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Terminal de Compras<span className="text-blue-500">.</span></h2>
            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em]">Axia Coffe</p>
          </div>
          {selectedClient && (
            <div className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md animate-in slide-in-from-right">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <User size={14} />
                </div>
                <div>
                    <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Cliente Activo</p>
                    <p className="text-xs font-black text-white uppercase">{selectedClient.firstName} {selectedClient.lastName}</p>
                </div>
            </div>
          )}
        </div>

        {!saleCompleted ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden pb-4">

            {/* PANEL DE CONFIGURACIÓN (CON SCROLL INDEPENDIENTE) */}
            <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar h-full">

              {/* SECCIÓN CLIENTE Y CONTRATOS */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 shadow-2xl shrink-0">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><User size={16} /></div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Identificación de Cliente</h3>
                </div>
                
                <SearchBarUniversal
                  searchType="clients"
                  onAddToCart={(item: any) => {
                    setSelectedClient(item);
                    setClientAnnouncements(item.announcements?.filter((a: any) => parseFloat(a.remantQuantity) > 0 && a.isActive) || []);
                  }}
                  showResults={true}
                  placeholder="Escribe nombre o NIT..." />

                {clientAnnouncements.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-3">Contratos / Acuerdos Disponibles</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[140px] overflow-y-auto custom-scrollbar p-1">
                      {clientAnnouncements.map((ann) => (
                        <button
                          key={ann.id}
                          onClick={() => {
                            const active = selectedAnnouncementId === ann.id;
                            if (active) {
                              setSelectedAnnouncementId(null); setPrice(""); setName(""); setSelectedProductId("");
                            } else {
                              setSelectedAnnouncementId(ann.id); setPrice(ann.price.toString()); setName(ann.product?.name || ann.title);
                              setSelectedProductId(ann.productId); setTax(ann.product?.tax || 0); setTenantIdProduct(ann.tenantId);
                            }
                          }}
                          className={`text-left p-3 rounded-xl border transition-all duration-300 relative overflow-hidden ${selectedAnnouncementId === ann.id ? 'bg-blue-600/80 border-blue-400 shadow-lg' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                        >
                          <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className={`text-[9px] font-black uppercase ${selectedAnnouncementId === ann.id ? 'text-white' : 'text-slate-400'}`}>{ann.title}</p>
                                <p className="text-xs font-mono font-bold mt-1">{formatCurrency(Number(ann.price))}</p>
                            </div>
                            <div className={`px-2 py-0.5 rounded-md text-[8px] font-black ${selectedAnnouncementId === ann.id ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-400'}`}>
                                {ann.remantQuantity} KG
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN PRODUCTO Y CANTIDAD */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 shadow-2xl shrink-0">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Package size={16} /></div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Selección de Ítems</h3>
                </div>

                <div className="space-y-4">
                  {selectedAnnouncementId ? (
                    <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-blue-500" />
                        <div>
                            <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none">Contrato Aplicado</p>
                            <p className="text-xs font-black text-white uppercase mt-1">{name}</p>
                        </div>
                      </div>
                      <button onClick={() => { setSelectedAnnouncementId(null); setName(""); setPrice(""); }} className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-500 rounded-lg transition-colors"><X size={16} /></button>
                    </div>
                  ) : (
                    <SearchBarUniversal
                      searchType="products"
                      onAddToCart={(p: any) => {
                        setName(p.name); setPrice(p.salePrice?.toString() || ''); setSelectedProductId(p.id); setTax(p.tax); setTenantIdProduct(p.tenantId);
                      }}
                      showResults={true}
                      placeholder="Buscar producto comercial..." />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-4 space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 ml-1"><Scale size={12} /> Cantidad</label>
                      <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value.replace(',', '.'))} placeholder="0.00 kg" className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-sm font-black text-white focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div className="md:col-span-5 space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 ml-1"><DollarSign size={12} /> Unitario</label>
                      <input type="text" value={price === "" ? "" : Number(price).toLocaleString('es-CO')} disabled={!!selectedAnnouncementId} onChange={(e) => setPrice(e.target.value.replace(/\./g, ""))} className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-sm font-mono font-black text-white outline-none disabled:opacity-50" />
                    </div>
                    <div className="md:col-span-3">
                        <button onClick={handleAddItem} disabled={!name || !quantity || !price} className="w-full h-11 bg-blue-600 text-white font-black uppercase text-[10px] rounded-xl hover:bg-blue-500 disabled:opacity-10 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                            <ShoppingCart size={14} /> Añadir
                        </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* LISTA DE ITEMS */}
              <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col min-h-[300px] shrink-0">
                <div className="bg-white/5 px-6 py-3 flex justify-between items-center shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Resumen de Carga</span>
                    <div className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-black uppercase">{items.length} Ítems</div>
                </div>
                <div className="flex-1 px-2">
                  <table className="w-full">
                    <tbody className="divide-y divide-white/5">
                      {items.map((item) => (
                        <tr key={item.id} className="group hover:bg-white/[0.03] transition-colors">
                          <td className="px-6 py-3">
                            <p className="text-xs font-black text-white uppercase tracking-tight italic">{item.name}</p>
                            <p className="text-[9px] text-slate-500 font-bold">{item.quantity} kg × {formatCurrency(item.price)}</p>
                          </td>
                          <td className="px-6 py-3 text-right font-mono text-sm font-black text-white tracking-tighter">
                            {formatCurrency(item.quantity * item.price)}
                          </td>
                          <td className="px-6 py-3 text-right w-10">
                            <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* PANEL DE CHECKOUT (FIJO) */}
            <div className="lg:col-span-4 h-full flex flex-col">
              <div className="bg-blue-900/40 backdrop-blur-md border border-blue-500/20 rounded-[2.5rem] p-6 text-white flex flex-col h-fit shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 p-10 opacity-5 rotate-12 text-white"><Receipt size={160} /></div>

                <div className="relative z-10 flex flex-col">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b border-white/10 pb-3">Checkout Final</h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Suma Parcial</span>
                            <span className="font-mono text-lg font-bold">{formatCurrency(calculateSubtotal())}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Impuestos (IVA)</span>
                            <span className="font-mono text-lg font-bold">{formatCurrency(calculateTaxTotal())}</span>
                        </div>
                        
                        <div className="pt-6 mt-6 border-t border-white/10">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] block mb-2 text-blue-400">Total a Cobrar</span>
                            <div className="text-4xl font-black font-mono tracking-tighter leading-none break-all text-white">
                                {formatCurrency(calculateTotal())}
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            onClick={handleCompleteSale}
                            disabled={items.length === 0 || !selectedClient || isProcessing}
                            className="w-full py-5 bg-white text-blue-900 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-50 shadow-xl disabled:opacity-20 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Venta'}
                        </button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ÉXITO */
          <div className="flex-1 flex items-center justify-center animate-in fade-in zoom-in px-4">
            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[3rem] p-10 text-center backdrop-blur-xl">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Venta Exitosa</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">Operación registrada correctamente.</p>
                
                <div className="flex flex-col gap-3">
                    <button onClick={() => pdfUrl && window.open(pdfUrl)} className="w-full py-4 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <Receipt size={16} /> Ver Factura
                    </button>
                    <button onClick={resetSaleForm} className="w-full py-4 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5">
                        Volver a Terminal
                    </button>
                </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}