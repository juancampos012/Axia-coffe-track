import React from 'react';
import { useTranslations } from 'next-intl';

import { Button } from './Button';
import { PriceTag } from './PriceTag';
import { FeatureItem } from './FeatureItem';
import Link from 'next/link';

interface PricingCardProps {
  title: string;
  price: number;
  period: 'mo' | 'yr';
  features: string[];
  highlighted?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period,
  features,
  highlighted = false,
}) => {
  const t = useTranslations("home.pricing.card")
  return (
    <div
      className={`bg-black rounded-lg p-6 border flex flex-col justify-between ${
        highlighted ? 'border-homePrimary' : 'border-gray-700'
      }`}
    >
      <div>
        <div className="mb-5">
          <PriceTag price={price} period={period} />
          <h3 className="text-gray-400 mt-1">{title}</h3>
        </div>

        <div className="border-t border-gray-800 my-6 pt-6">
          {features.map((feature, index) => (
            <FeatureItem key={index} text={feature} />
          ))}
        </div>
      </div>

      <div className="mt-5">
        <Link href={'/es/contactus'}><Button text={t("start")} primary={highlighted} /></Link>
      </div>
    </div>
  );
};