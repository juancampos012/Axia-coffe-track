import FactorPurchasePage from '@/modules/factor-purchase/FactorPurchasePage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compra por Factor · Axia Coffee',
  description: 'Registrar compra donde el precio final = precio base × factor',
};

export default function FactorPurchaseRoute() {
  return (
    <div className="w-full min-h-screen bg-[#04060f]">
      <FactorPurchasePage />
    </div>
  );
}
