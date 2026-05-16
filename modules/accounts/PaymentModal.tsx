'use client';

import { useState } from 'react';
import { X, DollarSign, AlignLeft, ArrowRight, Loader2, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

export type PaymentMode = 'abono' | 'cargo';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  currentBalance: number;
  /** Texto del modo "abono": e.g. "El aliado nos paga" */
  abonoLabel?: string;
  /** Texto del modo "cargo": e.g. "Registrar nueva entrega" */
  cargoLabel?: string;
  /** Callback al confirmar. Recibe modo, monto, descripción y si afecta balance */
  onConfirm: (mode: PaymentMode, amount: number, description: string, affectsBalance: boolean) => Promise<void>;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

export default function PaymentModal({
  isOpen, onClose, personName, currentBalance,
  abonoLabel = 'Registrar abono (nos pagan)',
  cargoLabel  = 'Registrar cargo (nuevo débito)',
  onConfirm,
}: PaymentModalProps) {
  const [mode, setMode]               = useState<PaymentMode>('abono');
  const [amount, setAmount]           = useState('');
  const [description, setDescription] = useState('');
  const [affectsBalance, setAffectsBalance] = useState(true);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  if (!isOpen) return null;

  const previewBalance =
    amount
      ? mode === 'abono'
        ? currentBalance - Number(amount)
        : currentBalance + Number(amount)
      : currentBalance;

  const handleConfirm = async () => {
    if (!amount || Number(amount) <= 0) {
      setError('Ingresa un monto válido mayor a cero');
      return;
    }
    setError('');
    try {
      setLoading(true);
      await onConfirm(mode, Number(amount), description.trim() || (mode === 'abono' ? 'Abono' : 'Cargo'), affectsBalance);
      // Reset
      setAmount('');
      setDescription('');
      setMode('abono');
      setAffectsBalance(true);
    } catch (e: any) {
      setError(e.message || 'Error al procesar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-[2rem] p-8 shadow-2xl"
        style={{
          background: 'rgba(10,17,32,0.98)',
          border: '1px solid rgba(30,60,139,0.35)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2
              className="text-xl font-black text-white tracking-tight"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Registrar movimiento
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {personName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>

        {/* Saldo actual */}
        <div
          className="p-4 rounded-2xl mb-6 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(30,60,139,0.2)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Saldo actual
          </span>
          <span
            className="text-lg font-black font-mono"
            style={{ color: currentBalance >= 0 ? 'rgba(74,127,255,0.9)' : 'rgba(248,113,113,0.9)' }}
          >
            {fmt(currentBalance)}
          </span>
        </div>

        {/* Selector modo */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setMode('abono')}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
              mode === 'abono'
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                : 'border-white/10 bg-white/[0.02] text-slate-500 hover:border-white/20'
            }`}
          >
            <TrendingDown size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">
              {abonoLabel}
            </span>
          </button>
          <button
            onClick={() => setMode('cargo')}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
              mode === 'cargo'
                ? 'border-red-500/50 bg-red-500/10 text-red-400'
                : 'border-white/10 bg-white/[0.02] text-slate-500 hover:border-white/20'
            }`}
          >
            <TrendingUp size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">
              {cargoLabel}
            </span>
          </button>
        </div>

        {/* Monto */}
        <div className="space-y-3 mb-5">
          <label className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <DollarSign size={12} /> Monto (COP)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-4xl font-mono font-black text-white outline-none focus:border-[#1E3C8b] transition-all"
          />
          {/* Preview saldo */}
          {amount && Number(amount) > 0 && (
            <div className="flex items-center justify-between px-2">
              <span className="text-[9px] text-slate-500 uppercase font-bold">Saldo resultante</span>
              <span
                className="text-sm font-black font-mono"
                style={{ color: previewBalance >= 0 ? 'rgba(74,127,255,0.9)' : 'rgba(248,113,113,0.9)' }}
              >
                {fmt(previewBalance)}
              </span>
            </div>
          )}
        </div>

        {/* Descripción */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <AlignLeft size={12} /> Descripción (opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Pago semana 20, entrega de café..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm font-medium text-white outline-none focus:border-[#1E3C8b] transition-all"
          />
        </div>

        {/* Toggle afecta balance */}
        <button
          type="button"
          onClick={() => setAffectsBalance(prev => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl mb-5 transition-all"
          style={{
            background: affectsBalance ? 'rgba(74,127,255,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${affectsBalance ? 'rgba(74,127,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          <div className="flex items-center gap-3">
            <Wallet size={14} style={{ color: affectsBalance ? '#4a7fff' : 'rgba(255,255,255,0.25)' }} />
            <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: affectsBalance ? '#4a7fff' : 'rgba(255,255,255,0.25)' }}>
                Afectar balance de caja
              </p>
              <p className="text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {affectsBalance ? 'Este movimiento modifica el saldo general' : 'Solo queda registrado, no mueve caja'}
              </p>
            </div>
          </div>
          {/* Switch visual */}
          <div
            className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
            style={{ background: affectsBalance ? '#4a7fff' : 'rgba(255,255,255,0.1)' }}
          >
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: affectsBalance ? '22px' : '2px' }}
            />
          </div>
        </button>

        {error && (
          <p className="text-xs text-red-400 font-bold mb-4 px-1">{error}</p>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !amount}
            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-30 ${
              mode === 'abono'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (
              <> Confirmar <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
