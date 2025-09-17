import React from 'react';

interface PriceTagProps {
  price: number;
  period: 'mo' | 'yr';
}

export const PriceTag: React.FC<PriceTagProps> = ({ price, period }) => {
  return (
    <div className="flex items-end">
      <span className="text-4xl font-bold text-white">${price}</span>
      <span className="text-gray-400 ml-1">/{period}</span>
    </div>
  );
};