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
      <div className="flex justify-between text-sm text-gray-400">
        <span>Subtotal:</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-400">
        <span>Impuestos:</span>
        <span>{formatCurrency(taxTotal)}</span>
      </div>
      <div className="flex justify-between text-2xl font-bold border-t border-gray-700 pt-3 text-green-400">
        <span>TOTAL:</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <button 
        onClick={onCompleteSale} 
        disabled={disabled}
        className="w-full py-4 mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-bold text-xl transition-all"
      >
        COBRAR (EFECTIVO)
      </button>
    </div>
  );
}