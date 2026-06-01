'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Loader2, AlertCircle, TrendingUp, TrendingDown,
  Minus, Plus, DollarSign, Clock, CheckCircle, XCircle, Pencil, X, Save,
  RotateCcw, Flag,
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
  editMovement?:   (movementId: string, body: { description?: string; amount?: number; affectsBalance?: boolean }) => Promise<any>;
  editCharge?:     (accountId:  string, body: { description?: string; amount?: number; affectsBalance?: boolean }) => Promise<any>;
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
  fetchDetail, registerPayment, registerCharge, editMovement, editCharge,
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

  // Cerrar período state
  const [closingPeriod, setClosingPeriod]   = useState(false);
  const [closeAffects, setCloseAffects]     = useState(true);
  const [closingSaving, setClosingSaving]   = useState(false);
  // Períodos anteriores expandidos
  const [expandedPeriods, setExpandedPeriods] = useState<Set<number>>(new Set());
  const [showAllPeriods, setShowAllPeriods]   = useState(false);

  const MAX_VISIBLE_PERIODS = 5;

  // Edit movement state
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [editingType, setEditingType]     = useState<'abono' | 'cargo'>('abono');
  const [editDesc, setEditDesc]           = useState('');
  const [editAmount, setEditAmount]       = useState('');
  const [editAffects, setEditAffects]     = useState(true);
  const [editSaving, setEditSaving]       = useState(false);

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

  const handleClosePeriod = async () => {
    if (!detail || detail.balance === 0) return;
    setClosingSaving(true);
    try {
      const dateStr = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
      const description = `Cierre de período · ${dateStr}`;
      if (detail.balance > 0) {
        await registerPayment(personId, detail.balance, description, closeAffects);
      } else {
        await registerCharge(personId, Math.abs(detail.balance), description, closeAffects);
      }
      setClosingPeriod(false);
      await Promise.all([
        loadDetail(),
        user?.tenantId ? refreshBalance(user.tenantId) : Promise.resolve(),
      ]);
    } catch (e: any) {
      alert(e.message || 'Error al cerrar el período');
    } finally {
      setClosingSaving(false);
    }
  };

  const startEdit = (mv: { id: string; description: string; amount: number; type: 'abono' | 'cargo' }) => {
    setEditingId(mv.id);
    setEditingType(mv.type);
    setEditDesc(mv.description);
    setEditAmount(String(mv.amount));
    setEditAffects(true);
  };

  const cancelEdit = () => { setEditingId(null); setEditDesc(''); setEditAmount(''); setEditAffects(true); };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const fn = editingType === 'abono' ? editMovement : editCharge;
    if (!fn) return;
    setEditSaving(true);
    try {
      const body: { description?: string; amount?: number; affectsBalance?: boolean } = {
        affectsBalance: editAffects,
      };
      if (editDesc.trim()) body.description = editDesc.trim();
      if (editAmount && Number(editAmount) > 0) body.amount = Number(editAmount);
      await fn(editingId, body);
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

  // ── Dividir movimientos en períodos por cierres ───────────────────────────
  // Backend devuelve movimientos OLDEST FIRST (orden estándar de DB)
  type Mv = typeof detail.movements[0];
  const allPeriods: Array<{ mvs: Mv[]; cierre?: Mv }> = [];
  let buf: Mv[] = [];
  for (const mv of detail.movements) {
    if (mv.description.startsWith('Cierre de período')) {
      allPeriods.push({ mvs: buf, cierre: mv }); // cierre cierra el período anterior
      buf = [];
    } else {
      buf.push(mv);
    }
  }
  // Último buffer = período actual (movimientos más recientes, sin cierre aún)
  allPeriods.push({ mvs: buf });

  // Período actual = ÚLTIMO (más reciente, después del último cierre)
  const currentMvs  = allPeriods[allPeriods.length - 1]?.mvs ?? [];
  // Períodos pasados = todos excepto el último, de más reciente a más antiguo
  const pastPeriods = allPeriods.slice(0, -1).reverse();
  const hasPastPeriods = pastPeriods.length > 0;

  const periodTotalCharged = currentMvs.filter(m => m.type === 'cargo').reduce((s, m) => s + Math.abs(m.amount), 0);
  const periodTotalPaid    = currentMvs.filter(m => m.type === 'abono').reduce((s, m) => s + Math.abs(m.amount), 0);

  // ── Agrupar movimientos FIFO del mismo pago ───────────────────────────────
  // El backend crea un registro por cada cargo pendiente pagado (FIFO).
  // Agrupamos consecutivos con mismo tipo+descripción creados dentro de 3 s.
  type GroupedMv = Mv & { _groupCount?: number };
  const groupMvs = (mvs: Mv[]): GroupedMv[] => {
    const out: GroupedMv[] = [];
    let i = 0;
    while (i < mvs.length) {
      const mv = mvs[i];
      let j = i + 1;
      let total = Math.abs(mv.amount);
      while (j < mvs.length) {
        const nx = mvs[j];
        const dt = Math.abs(new Date(nx.createdAt).getTime() - new Date(mv.createdAt).getTime());
        if (nx.type === mv.type && nx.description === mv.description && dt <= 3000) {
          total += Math.abs(nx.amount);
          j++;
        } else break;
      }
      out.push(j > i + 1 ? { ...mv, amount: total, _groupCount: j - i } : mv);
      i = j;
    }
    return out;
  };

  const togglePeriod = (i: number) =>
    setExpandedPeriods(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  // Helper: renderiza una fila de movimiento (puede ser agrupada)
  const renderMvRow = (mv: GroupedMv) => {
    const isAbono   = mv.type === 'abono';
    const isEditing = editingId === mv.id;
    const grouped   = (mv._groupCount ?? 1) > 1;
    return (
      <div
        key={mv.id}
        className="rounded-2xl transition-colors overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${isEditing ? 'rgba(74,127,255,0.4)' : 'rgba(30,60,139,0.15)'}` }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: isAbono ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}
            >
              {isAbono
                ? <TrendingDown size={16} style={{ color: '#10b981' }} />
                : <TrendingUp   size={16} style={{ color: '#ef4444' }} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-white truncate">{mv.description}</p>
                {grouped && (
                  <span
                    className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(74,127,255,0.15)', color: 'rgba(74,127,255,0.7)' }}
                  >
                    {mv._groupCount} pagos
                  </span>
                )}
              </div>
              <p className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {new Date(mv.createdAt).toLocaleString('es-CO')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-3">
            <div className="text-right">
              <p className="text-base font-black font-mono" style={{ color: isAbono ? '#10b981' : '#ef4444' }}>
                {isAbono ? '-' : '+'}{fmt(Math.abs(mv.amount))}
              </p>
              {mv.balanceAfter !== undefined && (
                <p className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Saldo: {fmt(mv.balanceAfter)}
                </p>
              )}
            </div>
            {((isAbono && editMovement) || (!isAbono && editCharge)) && !isEditing && (
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
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Afectar balance de caja
              </span>
              <button
                type="button"
                onClick={() => setEditAffects(v => !v)}
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
                style={{ background: editAffects ? '#4a7fff' : 'rgba(255,255,255,0.1)' }}
              >
                <span
                  className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                  style={{ transform: editAffects ? 'translateX(18px)' : 'translateX(2px)' }}
                />
              </button>
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
  };

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

      {/* TOTALES — período actual */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(30,60,139,0.25)' }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Total cargado
          </p>
          {hasPastPeriods && (
            <p className="text-[7px] uppercase tracking-widest mb-2" style={{ color: 'rgba(239,68,68,0.5)' }}>período actual</p>
          )}
          <p className="text-xl font-black font-mono text-white">{fmt(periodTotalCharged)}</p>
        </div>
        <div
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(30,60,139,0.25)' }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Total pagado
          </p>
          {hasPastPeriods && (
            <p className="text-[7px] uppercase tracking-widest mb-2" style={{ color: 'rgba(239,68,68,0.5)' }}>período actual</p>
          )}
          <p className="text-xl font-black font-mono text-white">{fmt(periodTotalPaid)}</p>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex gap-3">
        <button
          onClick={() => { setPaymentOpen(true); setClosingPeriod(false); }}
          className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all text-white"
          style={{ background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)', border: '1px solid rgba(74,127,255,0.3)' }}
        >
          <DollarSign size={16} /> Registrar movimiento
        </button>

        <button
          onClick={() => setClosingPeriod(v => !v)}
          title="Cerrar período / empezar de cero"
          className="px-5 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all"
          style={{
            background: closingPeriod ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${closingPeriod ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: closingPeriod ? '#f87171' : 'rgba(255,255,255,0.3)',
          }}
        >
          <RotateCcw size={15} />
          <span className="hidden sm:inline">Cerrar período</span>
        </button>
      </div>

      {/* PANEL CERRAR PERÍODO */}
      {closingPeriod && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(239,68,68,0.12)' }}>
              <Flag size={14} style={{ color: '#f87171' }} />
            </div>
            <div>
              <p className="text-sm font-black text-white mb-0.5">Cerrar período</p>
              <p className="text-[9px] font-mono leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {detail.balance === 0
                  ? 'El saldo ya está en $0. No hay nada que saldar.'
                  : detail.balance > 0
                  ? <>Se registrará un abono de <span style={{ color: '#10b981' }}>{fmt(detail.balance)}</span> para saldar la cuenta y llevarla a $0.</>
                  : <>Se registrará un cargo de <span style={{ color: '#ef4444' }}>{fmt(Math.abs(detail.balance))}</span> para saldar la cuenta y llevarla a $0.</>
                }
              </p>
            </div>
          </div>

          {detail.balance !== 0 && (
            <>
              {/* Toggle afectar balance */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Afectar balance de caja
                </span>
                <button
                  type="button"
                  onClick={() => setCloseAffects(v => !v)}
                  className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
                  style={{ background: closeAffects ? '#4a7fff' : 'rgba(255,255,255,0.1)' }}
                >
                  <span
                    className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                    style={{ transform: closeAffects ? 'translateX(18px)' : 'translateX(2px)' }}
                  />
                </button>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleClosePeriod}
                  disabled={closingSaving}
                  className="flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 text-white transition-all disabled:opacity-40"
                  style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}
                >
                  {closingSaving ? <Loader2 size={13} className="animate-spin" /> : <Flag size={13} />}
                  {closingSaving ? 'Cerrando...' : 'Confirmar cierre'}
                </button>
                <button
                  onClick={() => setClosingPeriod(false)}
                  className="px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
                >
                  Cancelar
                </button>
              </div>
            </>
          )}

          {detail.balance === 0 && (
            <button
              onClick={() => setClosingPeriod(false)}
              className="text-[9px] font-black uppercase tracking-widest transition-all"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              Cerrar
            </button>
          )}
        </div>
      )}

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
            {/* Período actual */}
            {currentMvs.length === 0 && hasPastPeriods ? (
              <div className="py-6 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>
                  Sin movimientos en el período actual
                </p>
              </div>
            ) : (
              groupMvs(currentMvs).map(mv => renderMvRow(mv))
            )}

            {/* Períodos anteriores — solo los que tienen movimientos, max 5 visibles */}
            {(() => {
              // Filtrar períodos vacíos (cierres sin movimientos = artefactos del bug FIFO)
              const withMvs = pastPeriods.filter(p => p.mvs.length > 0);
              const hidden   = withMvs.length - MAX_VISIBLE_PERIODS;
              const visible  = showAllPeriods ? withMvs : withMvs.slice(0, MAX_VISIBLE_PERIODS);

              return (
                <>
                  {visible.map((period, idx) => {
                    const isExpanded = expandedPeriods.has(idx);
                    const cierre = period.cierre;
                    return (
                      <div key={cierre?.id ?? `period-${idx}`}>
                        <button
                          onClick={() => togglePeriod(idx)}
                          className="w-full relative flex items-center gap-3 py-3"
                        >
                          <div className="flex-1 h-px" style={{ background: 'rgba(239,68,68,0.2)' }} />
                          <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full flex-shrink-0 transition-all"
                            style={{
                              background: isExpanded ? 'rgba(239,68,68,0.14)' : 'rgba(239,68,68,0.07)',
                              border: '1px solid rgba(239,68,68,0.22)',
                            }}
                          >
                            <Flag size={10} style={{ color: '#f87171' }} />
                            <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: '#f87171' }}>
                              Cierre de período
                            </span>
                            {cierre && (
                              <span className="text-[7px] font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                · {new Date(cierre.createdAt).toLocaleDateString('es-CO')}
                              </span>
                            )}
                            <span className="text-[7px] font-black uppercase tracking-widest ml-1"
                              style={{ color: 'rgba(255,255,255,0.25)' }}>
                              {isExpanded ? '▲ ocultar' : `▼ ${period.mvs.length} mov.`}
                            </span>
                          </div>
                          <div className="flex-1 h-px" style={{ background: 'rgba(239,68,68,0.2)' }} />
                        </button>

                        {isExpanded && (
                          <div className="space-y-2 mt-1 pl-3 border-l-2" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
                            {groupMvs(period.mvs).map(mv => renderMvRow(mv))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Botón "Ver períodos más antiguos" */}
                  {hidden > 0 && !showAllPeriods && (
                    <button
                      onClick={() => setShowAllPeriods(true)}
                      className="w-full py-3 text-[9px] font-black uppercase tracking-widest transition-all"
                      style={{ color: 'rgba(255,255,255,0.2)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                    >
                      ▼ Ver {hidden} período{hidden !== 1 ? 's' : ''} más antiguo{hidden !== 1 ? 's' : ''}
                    </button>
                  )}
                  {showAllPeriods && withMvs.length > MAX_VISIBLE_PERIODS && (
                    <button
                      onClick={() => setShowAllPeriods(false)}
                      className="w-full py-3 text-[9px] font-black uppercase tracking-widest transition-all"
                      style={{ color: 'rgba(255,255,255,0.2)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                    >
                      ▲ Mostrar menos
                    </button>
                  )}
                </>
              );
            })()}
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
