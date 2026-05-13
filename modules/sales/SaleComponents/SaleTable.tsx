import { useTranslations } from 'next-intl';
import { SaleItem } from '@/types/Api';

interface Props {
  items: SaleItem[];
  handleRemoveItem: (id: number) => void;
  formatCurrency: (value: number) => string;
}

export default function SaleTable({ items, handleRemoveItem, formatCurrency }: Props) {
  const t = useTranslations("makeSale");

  return (
    <div className="overflow-x-auto flex-grow" style={{ borderBottom: "1px solid rgba(30,60,139,0.25)" }}>
      {items.length > 0 ? (
        <table className="min-w-full">
          <thead>
            <tr style={{ background: "rgba(30,60,139,0.08)" }}>
              <th className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(74,127,255,0.7)" }}>{t('table.product')}</th>
              <th className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(74,127,255,0.7)" }}>{t('table.quantity')}</th>
              <th className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(74,127,255,0.7)" }}>{t('table.priceNoTax')}</th>
              <th className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(74,127,255,0.7)" }}>{t('table.tax')}</th>
              <th className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(74,127,255,0.7)" }}>{t('table.priceWithTax')}</th>
              <th className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(74,127,255,0.7)" }}>{t('table.subtotal')}</th>
              <th className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(74,127,255,0.7)" }}>{t('table.action')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.id}
                style={{ borderBottom: "1px solid rgba(30,60,139,0.15)", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}
              >
                <td className="px-4 py-2 text-sm text-white">{item.name}</td>
                <td className="px-4 py-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{item.quantity}</td>
                <td className="px-4 py-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{formatCurrency(item.basePrice)}</td>
                <td className="px-4 py-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{item.tax}%</td>
                <td className="px-4 py-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{formatCurrency(item.price)}</td>
                <td className="px-4 py-2 text-sm font-bold text-white">{formatCurrency(item.quantity * item.price)}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-lg transition-colors"
                    style={{ color: "rgba(239,68,68,0.7)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "rgba(239,68,68,1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(239,68,68,0.7)"; }}
                  >
                    {t('remove')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex items-center justify-center h-full py-20">
          <p className="text-xs font-bold uppercase tracking-widest italic" style={{ color: "rgba(255,255,255,0.2)" }}>{t('noItems')}</p>
        </div>
      )}
    </div>
  );
}
