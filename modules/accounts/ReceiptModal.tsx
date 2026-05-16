'use client';

import { useRef } from 'react';
import { X, Printer, CheckCircle, FileDown } from 'lucide-react';
import { PaymentMode } from './PaymentModal';
import { generateMovementPDF } from './AccountMovementPDF';

interface CompanyInfo {
  name?: string;
  address?: string;
  nit?: string;
  phone?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: {
    personName: string;
    personType: 'Aliado' | 'Cliente' | 'Proveedor';
    personPhone?: string;
    mode: PaymentMode;
    amount: number;
    description: string;
    balanceBefore: number;
    balanceAfter: number;
    date: string;
    receiptNumber: string;
  } | null;
  company?: CompanyInfo;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

export default function ReceiptModal({ isOpen, onClose, receipt, company }: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !receipt) return null;

  const isAbono = receipt.mode === 'abono';

  const handleViewPDF = () => {
    if (!receipt) return;
    const blob = generateMovementPDF({
      receiptNumber: receipt.receiptNumber,
      date:          receipt.date,
      personName:    receipt.personName,
      personType:    receipt.personType,
      personPhone:   receipt.personPhone,
      mode:          receipt.mode,
      amount:        receipt.amount,
      description:   receipt.description,
      balanceBefore: receipt.balanceBefore,
      balanceAfter:  receipt.balanceAfter,
      company,
    });
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Recibo #${receipt.receiptNumber}</title>
          <style>
            body { font-family: monospace; padding: 24px; background: white; color: black; }
            .divider { border-top: 1px dashed #999; margin: 12px 0; }
            .row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 13px; }
            .label { color: #555; }
            .value { font-weight: bold; }
            .title { font-size: 18px; font-weight: 900; text-align: center; margin-bottom: 4px; }
            .sub { font-size: 10px; text-align: center; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
            .amount { font-size: 28px; font-weight: 900; text-align: center; margin: 12px 0; }
            .footer { text-align: center; font-size: 10px; color: #aaa; margin-top: 16px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-sm rounded-[2rem] p-8 shadow-2xl"
        style={{
          background: 'rgba(10,17,32,0.98)',
          border: '1px solid rgba(30,60,139,0.35)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <X size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
        </button>

        {/* Check icon */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
            style={{ background: isAbono ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}
          >
            <CheckCircle size={28} style={{ color: isAbono ? '#10b981' : '#ef4444' }} />
          </div>
          <h2 className="text-lg font-black text-white">¡Movimiento registrado!</h2>
          <p className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {isAbono ? 'Abono recibido' : 'Cargo registrado'}
          </p>
        </div>

        {/* Recibo imprimible */}
        <div
          ref={printRef}
          className="rounded-2xl p-5 space-y-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(30,60,139,0.2)' }}
        >
          <div className="title" style={{ display: 'none' }}>AXIA COFFEE</div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-center mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
            RECIBO #{receipt.receiptNumber}
          </p>

          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {receipt.personType}
            </span>
            <span className="text-sm font-black text-white">{receipt.personName}</span>
          </div>

          <div
            className="h-px my-2"
            style={{ background: 'rgba(30,60,139,0.3)', borderTop: '1px dashed rgba(30,60,139,0.4)' }}
          />

          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Concepto</span>
            <span className="text-xs font-bold text-white max-w-[55%] text-right">{receipt.description}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Fecha</span>
            <span className="text-xs font-mono text-white">
              {new Date(receipt.date).toLocaleString('es-CO')}
            </span>
          </div>

          <div
            className="h-px my-2"
            style={{ background: 'rgba(30,60,139,0.3)', borderTop: '1px dashed rgba(30,60,139,0.4)' }}
          />

          {/* Monto grande */}
          <div className="text-center py-3">
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {isAbono ? 'Valor abonado' : 'Valor cargado'}
            </p>
            <p
              className="text-4xl font-black font-mono"
              style={{ color: isAbono ? '#10b981' : '#ef4444' }}
            >
              {isAbono ? '+' : '-'}{fmt(receipt.amount)}
            </p>
          </div>

          <div
            className="h-px my-2"
            style={{ background: 'rgba(30,60,139,0.3)', borderTop: '1px dashed rgba(30,60,139,0.4)' }}
          />

          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Saldo anterior</span>
            <span className="text-sm font-mono text-white">{fmt(receipt.balanceBefore)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Saldo nuevo</span>
            <span
              className="text-sm font-mono font-black"
              style={{ color: receipt.balanceAfter >= 0 ? 'rgba(74,127,255,0.9)' : 'rgba(248,113,113,0.9)' }}
            >
              {fmt(receipt.balanceAfter)}
            </span>
          </div>

          <p className="text-[8px] text-center mt-3" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Axia Coffee Track · Documento informativo
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-2 mt-6">
          <div className="flex gap-3">
            <button
              onClick={handleViewPDF}
              className="flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-white"
              style={{ background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)' }}
            >
              <FileDown size={14} /> Ver
            </button>
            <button
              onClick={handlePrint}
              className="py-3.5 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
              style={{ border: '1px solid rgba(74,127,255,0.3)', color: 'rgba(255,255,255,0.5)' }}
            >
              <Printer size={14} />
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
