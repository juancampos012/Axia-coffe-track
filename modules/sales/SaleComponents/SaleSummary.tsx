'use client';

interface SaleSummaryProps {
  subtotal: number;
  taxTotal: number;
  total: number;
  onCompleteSale: () => void;
  disabled: boolean;
  formatCurrency: (value: number) => string;
}

export default function SaleSummary({
  subtotal,
  taxTotal,
  total,
  onCompleteSale,
  disabled,
  formatCurrency
}: SaleSummaryProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
        <span>Subtotal:</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
        <span>Impuestos:</span>
        <span>{formatCurrency(taxTotal)}</span>
      </div>
      <div
        className="flex justify-between text-2xl font-bold pt-3"
        style={{ borderTop: "1px solid rgba(30,60,139,0.4)", color: "#10b981" }}
      >
        <span>TOTAL:</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <button
        onClick={onCompleteSale}
        disabled={disabled}
        className="w-full py-4 mt-4 rounded-xl font-bold text-xl text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", boxShadow: "0 4px 14px rgba(5,150,105,0.4)" }}
      >
        COBRAR (EFECTIVO)
      </button>
    </div>
  );
}
