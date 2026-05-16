'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Loader2, AlertCircle, TrendingUp, TrendingDown,
  Minus, Plus, DollarSign, Clock, CheckCircle, XCircle, Pencil, X, Save,
} from 'lucide-react';
import PaymentModal, { PaymentMode } from './PaymentModal';
import ReceiptModal from './ReceiptModal';
import { AccountDetail as AccountDetailType, AccountType } from '@/request/accounts';
import { useBalance } from '@/context/BalanceContext';
import { useAuth } from '@/context/AuthContext';
import { getCompanyById } from '@/request/companies';

interface AccountDetailProps {
  personId: string;
  type: AccountType;
  personTypeName: 'Aliado' | 'Cliente' | 'Proveedor';
  /** Etiquetas para los botones y el modal */
  abonoLabel?: string;
  cargoLabel?: string;
  /** Texto de "balance positivo = ..." */
  positiveLabel?: string;
  negativeLabel?: string;
  fetchDetail: (id: string) => Promise<AccountDetailType>;
  registerPayment: (id: string, amount: number, description: string, affectsBalance: boolean) => Promise<any>;
  registerCharge:  (id: string, amount: number, description: string, affectsBalance: boolean) => Promise<any>;
  editMovement?:   (movementId: string, body: { description?: string; amount?: number }) => Promise<any>;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

let receiptCounter = 1000;

export default function AccountDetailView({
  personId, type, personTypeName,
  abonoLabel = 'Registrar abono (nos pagan)',
  cargoLabel  = 'Registrar cargo (nuevo débito)',
  positiveLabel = 'Te deben',
  negativeLabel  = 'Debes',
  fetchDetail, registerPayment, registerCharge, editMovement,
}: AccountDetailProps) {
  const router = useRouter();
  const { refreshBalance } = useBalance();
  const { user } = useAuth();
  const [company, setCompany] = useState<{ name?: string; address?: string; nit?: string; phone?: string } | undefined>();

  const [detail, setDetail]     = useState<AccountDetailType | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Edit movement state
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editDesc, setEditDesc]       = useState('');
  const [editAmount, setEditAmount]   = useState('');
  const [editSaving, setEditSaving]   = useState(false);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDetail(personId);
      setDetail(data);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Error al cargar la cuenta');
    } finally {
      setLoading(false);
    }
  }, [personId, fetchDetail]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  // Cargar datos de la empresa para el PDF
  useEffect(() => {
    if (!user?.tenantId) return;
    getCompanyById(user.tenantId)
      .then((c) => setCompany({ name: c.name, address: c.address, nit: c.nit, phone: c.phone }))
      .catch(() => {/* silencioso */});
  }, [user?.tenantId]);

  const handleConfirm = async (mode: PaymentMode, amount: number, description: string, affectsBalance: boolean) => {
    if (!detail) return;
    const balanceBefore = detail.balance;

    if (mode === 'abono') {
      await registerPayment(personId, amount, description, affectsBalance);
    } else {
      await registerCharge(personId, amount, description, affectsBalance);
    }

    const balanceAfter = mode === 'abono' ? balanceBefore - amount : balanceBefore + amount;

    setReceiptData({
      personName:    detail.personName,
      personPhone:   detail.personPhone,
      personType:    personTypeName,
      mode,
      amount,
      description,
      balanceBefore,
      balanceAfter,
      date:          new Date().toISOString(),
      receiptNumber: String(++receiptCounter),
    });

    setPaymentOpen(false);
    setReceiptOpen(true);

    // Recargar detalle y actualizar balance global sin recargar la página
    await Promise.all([
      loadDetail(),
      user?.tenantId ? refreshBalance(user.tenantId) : Promise.resolve(),
    ]);
  };

  const handleReceiptClose = () => {
    setReceiptOpen(false);
    setReceiptData(null);
  };

  const startEdit = (mv: { id: string; description: string; amount: number }) => {
    setEditingId(mv.id);
    setEditDesc(mv.description);
    setEditAmount(String(mv.amount));
  };

  const cancelEdit = () => { setEditingId(null); setEditDesc(''); setEditAmount(''); };

  const handleSaveEdit = async () => {
    if (!editingId || !editMovement) return;
    setEditSaving(true);
    try {
      const body: { description?: string; amount?: number } = {};
      if (editDesc.trim()) body.description = editDesc.trim();
      if (editAmount && Number(editAmount) > 0) body.amount = Number(editAmount);
      await editMovement(editingId, body);
      cancelEdit();
      await Promise.all([
        loadDetail(),
        user?.tenantId ? refreshBalance(user.tenantId) : Promise.resolve(),
      ]);
    } catch (e: any) {
      alert(e.message || 'Error al guardar');
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="animate-spin" size={32} style={{ color: '#4a7fff' }} />
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Cargando cuenta...
        </p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm font-bold text-red-400">{error || 'No encontrado'}</p>
        <button onClick={() => router.back()} className="text-[10px] underline uppercase tracking-widest text-slate-500">
          Volver
        </button>
      </div>
    );
  }

  const isPositive = detail.balance > 0;
  const isNeutral  = detail.balance === 0;
  const balanceColor = isNeutral
    ? 'rgba(255,255,255,0.5)'
    : isPositive
    ? '#4a7fff'
    : '#f87171';

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"
        style={{ color: 'rgba(255,255,255,0.3)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
      >
        <ArrowLeft size={14} /> Volver a cuentas
      </button>

      {/* ENCABEZADO + BALANCE */}
      <div
        className="rounded-2xl p-px"
        style={{ background: 'linear-gradient(135deg, rgba(30,60,139,0.6) 0%, rgba(74,127,255,0.2) 100%)' }}
      >
        <div
          className="rounded-[15px] p-8"
          style={{ background: 'rgba(4,6,18,0.96)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Info persona */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                style={{ background: 'rgba(30,60,139,0.4)', border: '1px solid rgba(74,127,255,0.3)' }}
              >
                {detail.personName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xl font-black text-white uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {detail.personName}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {personTypeName} · {detail.personPhone || 'Sin teléfono'}
                </p>
              </div>
            </div>

            {/* Balance */}
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {isNeutral ? 'Al día' : isPositive ? positiveLabel : negativeLabel}
              </p>
              <p className="text-4xl font-black font-mono" style={{ color: balanceColor }}>
                {isNeutral ? '$0' : (isPositive ? '+' : '') + fmt(detail.balance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TOTALES */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(30,60,139,0.25)' }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Total cargado
          </p>
          <p className="text-xl font-black font-mono text-white">{fmt(detail.totalCharged)}</p>
        </div>
        <div
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(30,60,139,0.25)' }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Total pagado
          </p>
          <p className="text-xl font-black font-mono text-white">{fmt(detail.totalPaid)}</p>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex gap-3">
        <button
          onClick={() => setPaymentOpen(true)}
          className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all text-white"
          style={{ background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)', border: '1px solid rgba(74,127,255,0.3)' }}
        >
          <DollarSign size={16} /> Registrar movimiento
        </button>
      </div>

      {/* HISTORIAL */}
      <div>
        <h3
          className="text-[10px] font-black uppercase tracking-widest mb-4"
          style={{ color: 'rgba(74,127,255,0.7)' }}
        >
          Historial de movimientos
        </h3>

        {detail.movements.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(30,60,139,0.15)' }}
          >
            <Clock size={32} style={{ color: 'rgba(255,255,255,0.1)' }} />
            <p className="text-[10px] font-black uppercase tracking-widest mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Sin movimientos registrados
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {detail.movements.map((mv) => {
              const isAbono  = mv.type === 'abono';
              const isEditing = editingId === mv.id;
              return (
                <div
                  key={mv.id}
                  className="rounded-2xl transition-colors overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${isEditing ? 'rgba(74,127,255,0.4)' : 'rgba(30,60,139,0.15)'}` }}
                >
                  {/* Row normal */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: isAbono ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}
                      >
                        {isAbono
                          ? <TrendingDown size={16} style={{ color: '#10b981' }} />
                          : <TrendingUp size={16} style={{ color: '#ef4444' }} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{mv.description}</p>
                        <p className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {new Date(mv.createdAt).toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <div className="text-right">
                        <p className="text-base font-black font-mono" style={{ color: isAbono ? '#10b981' : '#ef4444' }}>
                          {isAbono ? '-' : '+'}{fmt(mv.amount)}
                        </p>
                        {mv.balanceAfter !== undefined && (
                          <p className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            Saldo: {fmt(mv.balanceAfter)}
                          </p>
                        )}
                      </div>
                      {/* Botón editar — solo abonos (pagos) */}
                      {editMovement && isAbono && !isEditing && (
                        <button
                          onClick={() => startEdit(mv)}
                          className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                          style={{ color: 'rgba(255,255,255,0.2)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#4a7fff')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                          title="Editar movimiento"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      {isEditing && (
                        <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Panel de edición inline */}
                  {isEditing && (
                    <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'rgba(74,127,255,0.2)' }}>
                      <div className="pt-3 grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[8px] font-black uppercase tracking-widest block mb-1.5" style={{ color: 'rgba(74,127,255,0.7)' }}>
                            Descripción
                          </label>
                          <input
                            value={editDesc}
                            onChange={e => setEditDesc(e.target.value)}
                            className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(74,127,255,0.3)' }}
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-black uppercase tracking-widest block mb-1.5" style={{ color: 'rgba(74,127,255,0.7)' }}>
                            Monto (COP)
                          </label>
                          <input
                            type="number"
                            value={editAmount}
                            onChange={e => setEditAmount(e.target.value)}
                            className="w-full rounded-xl px-3 py-2 text-sm font-mono text-white outline-none"
                            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(74,127,255,0.3)' }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleSaveEdit}
                        disabled={editSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all disabled:opacity-40"
                        style={{ background: 'rgba(74,127,255,0.2)', border: '1px solid rgba(74,127,255,0.4)' }}
                      >
                        {editSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        {editSaving ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALES */}
      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        personName={detail.personName}
        currentBalance={detail.balance}
        abonoLabel={abonoLabel}
        cargoLabel={cargoLabel}
        onConfirm={handleConfirm}
      />
      <ReceiptModal
        isOpen={receiptOpen}
        onClose={handleReceiptClose}
        receipt={receiptData}
        company={company}
      />
    </div>
  );
}
