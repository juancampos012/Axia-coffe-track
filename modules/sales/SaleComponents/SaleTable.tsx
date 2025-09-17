import { useTranslations } from 'next-intl';
import { SaleItem } from '@/types/Api';

interface Props {
  items: SaleItem[];
  handleRemoveItem: (id: number) => void;
  formatCurrency: (value: number) => string;
}

export default function SaleTable({ items, handleRemoveItem, formatCurrency }: Props) {
  const t = useTranslations("makeSale");
  console.log("hola desde la tabla", items);

  return (
    <div className="overflow-x-auto border-b border-gray-700 flex-grow">
      {items.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-2">{t('table.product')}</th>
              <th className="px-4 py-2">{t('table.quantity')}</th>
              <th className="px-4 py-2">{t('table.priceNoTax')}</th>
              <th className="px-4 py-2">{t('table.tax')}</th>
              <th className="px-4 py-2">{t('table.priceWithTax')}</th>
              <th className="px-4 py-2">{t('table.subtotal')}</th>
              <th className="px-4 py-2">{t('table.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">{formatCurrency(item.basePrice)}</td>
                <td className="px-4 py-2">{item.tax}%</td>
                <td className="px-4 py-2">{formatCurrency(item.price)}</td>
                <td className="px-4 py-2">{formatCurrency(item.quantity * item.price)}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-400 hover:text-red-600 px-3 py-1 rounded hover:bg-red-900/30 transition-colors"
                  >
                    {t('remove')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400 italic py-20">{t('noItems')}</p>
        </div>
      )}
    </div>
  );
}
