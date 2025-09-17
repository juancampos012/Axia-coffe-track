import React from 'react';
import { CheckIcon } from 'lucide-react';

interface FeatureItemProps {
  text: string;
}

export const FeatureItem: React.FC<FeatureItemProps> = ({ text }) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-homePrimary">
        <CheckIcon size={16} />
      </span>
      <span className="text-gray-300 text-sm">{text}</span>
    </div>
  );
};