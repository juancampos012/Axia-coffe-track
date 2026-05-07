'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Coffee, DollarSign, 
  ArrowUpRight, ArrowDownLeft, 
  Loader2, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { getPartnerById, getPartnerAccounts, createPartnerAccount, addPartnerAccountPayment } from '@/request/partner';
import { useBalance } from '@/context/BalanceContext';

interface Props {
  partnerId: string;
}

export default function ScreenPartnerDetail({ partnerId }: Props) {
  const router = useRouter();
  const { balance, setBalance } = useBalance();

  const [partner, setPartner] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [displayAmount, setDisplayAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [partnerData, accountsData] = await Promise.all([
        getPartnerById(partnerId),
        getPartnerAccounts(partnerId)
      ]);

      setPartner(partnerData);
      setAccounts(accountsData);

      const firstPending = accountsData.find((a: any) => !a.isPaid);
      if (firstPending) setSelectedAccount(firstPending);
    } catch (error) {
      console.error("Error cargando aliado:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (partnerId) loadData(); 
  }, [partnerId]);

  const fCurrency = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  const handleMoneyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const formatted = new Intl.NumberFormat('es-CO').format(Number(rawValue));
    setDisplayAmount(rawValue === "" ? "" : formatted);
  };

  const totalPendingBalance = accounts.reduce((acc, curr) => acc + Number(curr.pendingAmount), 0);
  const totalPackaging = partner?.packagingMovements?.length || 0;

  // =========================
  // 🔥 CORRECCIÓN IMPORTANTE
  // =========================

  const handleCreateDebt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const rawValue = displayAmount.replace(/\D/g, "");
    const amountNum = Number(rawValue);
    const formData = new FormData(e.currentTarget);

    try {
      setFormLoading(true);

      await createPartnerAccount({
        partnerId,
        tenantId: partner.tenantId,
        originalAmount: amountNum,
        description: formData.get('description')
      });

      // ✅ FIX: update global state safely
      setBalance(Number(balance ?? 0) - Number(amountNum));

      setShowCoffeeModal(false);
      setDisplayAmount("");
      await loadData();
      router.refresh();

    } catch {
      alert("Error al registrar entrega");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const rawValue = displayAmount.replace(/\D/g, "");
    const amountNum = Number(rawValue);

    if (amountNum > Number(selectedAccount?.pendingAmount)) return;

    try {
      setFormLoading(true);

      await addPartnerAccountPayment({
        accountId: selectedAccount.id,
        amount: amountNum,
        description: (e.currentTarget.elements.namedItem('description') as HTMLTextAreaElement).value
      });

      // ✅ FIX: update global state safely
      setBalance(Number(balance ?? 0) + Number(amountNum));

      setShowPaymentModal(false);
      setDisplayAmount("");
      await loadData();
      router.refresh();

    } catch {
      alert("Error al registrar abono");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a1120] text-blue-500">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em]">
        Cargando Expediente...
      </p>
    </div>
  );

  return (
    <div className="w-full h-full p-6 text-slate-200 bg-[#0a1120] flex flex-col font-sans overflow-hidden relative">
      
      {/* CABECERA */}
      <div className="mb-8 flex justify-between items-center shrink-0">
        <div className="flex gap-5 items-center">
          <button onClick={() => router.back()} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all shadow-xl">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
              Expediente: <span className="text-blue-500 text-2xl">{partner?.name}</span>
            </h2>
            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em]">NIT: {partner?.identification || 'No registrado'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        {/* LADO IZQUIERDO */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <DollarSign className="absolute -right-6 -bottom-6 opacity-10 rotate-12" size={150} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-80 italic">Saldo Total por Cobrar</h3>
            <div className="text-4xl font-black font-mono tracking-tighter">{fCurrency(totalPendingBalance)}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden">
            <Coffee className="absolute -right-6 -bottom-6 text-amber-600/10 rotate-12" size={120} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-slate-500 italic">Movimientos de Empaque</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-white tracking-tighter">{totalPackaging}</span>
              <span className="text-lg font-black text-amber-500 italic uppercase">Registros</span>
            </div>
          </div>
        </div>

        {/* LADO DERECHO */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => { setDisplayAmount(""); setShowCoffeeModal(true); }} className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white p-5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95">
              <ArrowUpRight size={18} /> Nueva Entrega
            </button>
            <button onClick={() => { setDisplayAmount(""); setShowPaymentModal(true); }} className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white p-5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">
              <ArrowDownLeft size={18} className="text-blue-400" /> Registrar Abono Dinero
            </button>
          </div>

          {/* TABLA CON FILAS EXPANDIBLES */}
          <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] flex-1 flex flex-col overflow-hidden shadow-2xl">
            <div className="bg-white/5 px-8 py-5 border-b border-white/5 font-black uppercase italic text-[10px] text-slate-400">
               Cuentas Corrientes Activas (Click para ver abonos)
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#0a1120] border-b border-white/5 z-10 text-[9px] uppercase text-slate-500">
                  <tr><th className="px-8 py-4">Fecha</th><th className="px-8 py-4">Descripción</th><th className="px-8 py-4 text-right">Saldo</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {accounts.map((acc) => (
                    <React.Fragment key={acc.id}>
                      <tr 
                        onClick={() => setExpandedRow(expandedRow === acc.id ? null : acc.id)} 
                        className={`hover:bg-white/[0.05] transition-colors cursor-pointer group ${expandedRow === acc.id ? 'bg-white/[0.03]' : ''}`}
                      >
                        <td className="px-8 py-6 text-[10px] font-bold text-slate-500">{new Date(acc.createdAt).toLocaleDateString()}</td>
                        <td className="px-8 py-6 text-sm font-black text-white uppercase flex items-center gap-2">
                          {acc.description} 
                          {expandedRow === acc.id ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-slate-600" />}
                        </td>
                        <td className="px-8 py-6 text-right text-lg font-mono font-black">{fCurrency(acc.pendingAmount)}</td>
                      </tr>
                      {expandedRow === acc.id && (
                        <tr className="bg-black/20">
                          <td colSpan={3} className="px-12 py-4 border-l-4 border-blue-500">
                            <div className="space-y-3">
                              <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Historial de Pagos:</p>
                              {acc.payments?.map((p: any) => (
                                <div key={p.id} className="flex justify-between items-center text-[11px] border-b border-white/5 pb-2">
                                  <div className="flex flex-col">
                                    <span className="text-white font-black uppercase">{p.description || 'Abono realizado'}</span>
                                    <span className="text-slate-500 text-[9px]">{new Date(p.createdAt).toLocaleString()}</span>
                                  </div>
                                  <span className="text-emerald-500 font-mono font-bold">+{fCurrency(p.amount)}</span>
                                </div>
                              ))}
                              {(!acc.payments || acc.payments.length === 0) && <p className="text-[10px] italic text-slate-600">No hay abonos registrados en esta cuenta</p>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ENTREGA */}
      {showCoffeeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black italic uppercase text-white">Nueva Entrega</h3><button onClick={() => setShowCoffeeModal(false)}><X className="text-slate-500" /></button></div>
            <form onSubmit={handleCreateDebt} className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-500 block tracking-widest">Valor de la Carga (COP)</label>
              <input value={displayAmount} onChange={handleMoneyInput} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-mono focus:border-emerald-500 outline-none" placeholder="0" />
              <label className="text-[10px] font-black uppercase text-slate-500 block tracking-widest">Descripción / Lote</label>
              <textarea name="description" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500 h-24" placeholder="Lote #..." />
              <button disabled={formLoading} className="w-full bg-emerald-600 p-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-500 transition-all">{formLoading ? 'Procesando...' : 'Confirmar Entrega'}</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ABONO */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black italic uppercase text-white">Registrar Abono</h3><button onClick={() => setShowPaymentModal(false)}><X className="text-slate-500" /></button></div>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-500 block tracking-widest">Seleccionar Cuenta</label>
              <select 
                value={selectedAccount?.id}
                onChange={(e) => setSelectedAccount(accounts.find(a => a.id === e.target.value))} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none"
              >
                {accounts.filter(a => !a.isPaid).map(a => (
                  <option key={a.id} value={a.id} className="bg-[#0f172a]">{a.description} ({fCurrency(a.pendingAmount)})</option>
                ))}
              </select>
              
              <label className="text-[10px] font-black uppercase text-slate-500 block tracking-widest">Monto Abono</label>
              <input 
                value={displayAmount} 
                onChange={handleMoneyInput} 
                required 
                className={`w-full bg-white/5 border ${Number(displayAmount.replace(/\D/g, "")) > Number(selectedAccount?.pendingAmount) ? 'border-red-500 ring-1 ring-red-500' : 'border-white/10'} rounded-2xl p-4 text-white font-mono outline-none`} 
                placeholder="0" 
              />
              
              {Number(displayAmount.replace(/\D/g, "")) > Number(selectedAccount?.pendingAmount) && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter animate-pulse">
                  Error: El abono no puede superar los {fCurrency(selectedAccount?.pendingAmount)}
                </p>
              )}

              <label className="text-[10px] font-black uppercase text-slate-500 block tracking-widest">Nota de Pago</label>
              <textarea name="description" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none h-20" placeholder="Ejem: Pago por transferencia Bancolombia" />
              
              <button 
                disabled={formLoading || Number(displayAmount.replace(/\D/g, "")) > Number(selectedAccount?.pendingAmount) || !displayAmount} 
                className="w-full bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 p-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-500 transition-all"
              >
                {formLoading ? 'Registrando...' : 'Confirmar Abono'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}