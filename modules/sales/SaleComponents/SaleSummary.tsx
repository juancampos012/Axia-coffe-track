import { useTranslations } from 'next-intl';

interface Props {
  subtotal: number;
  taxTotal: number;
  total: number;
  onCompleteSale: () => void;
  disabled: boolean;
  formatCurrency: (value: number) => string;
}

export default function SaleSummary({
  subtotal, taxTotal, total,
  onCompleteSale, disabled, formatCurrency
}: Props) {
  const t = useTranslations("makeSale");

  return (
    <div className="pt-4 space-y-2 text-right">
      <div className="flex justify-between">
        <span className="font-medium">{t('subtotal')}:</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">{t('totalTaxes')}:</span>
        <span>{formatCurrency(taxTotal)}</span>
      </div>
      <div className="flex justify-between text-lg font-bold mt-2">
        <span>{t('totalToPay')}:</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <button
        onClick={onCompleteSale}
        disabled={disabled}
        className="w-full px-6 py-3 mt-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-500 transition-colors text-lg font-medium"
      >
        {t('completeSale')}
      </button>
    </div>
  );
}
