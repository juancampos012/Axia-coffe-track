import React from 'react';
import { SearchX } from 'lucide-react';
import { useTranslations } from "next-intl";

interface EmptyStateProps {
  message: string;
  searchTerm?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  searchTerm,
  icon,
}) => {
  const t = useTranslations("searchBar");

  return (
    <div
      className="w-full py-16 flex flex-col items-center justify-center rounded-2xl"
      style={{
        background: 'rgba(8,12,28,0.5)',
        border: '1px dashed rgba(30,60,139,0.3)',
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: 'rgba(30,60,139,0.15)',
          border: '1px solid rgba(30,60,139,0.3)',
        }}
      >
        {icon ?? <SearchX size={24} style={{ color: '#4a7fff' }} />}
      </div>
      <h3
        className="text-base font-medium mb-1"
        style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Syne, sans-serif' }}
      >
        {message}
      </h3>
      {searchTerm && (
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {t("noResultsFor")}{' '}
          <span className="font-medium" style={{ color: 'rgba(74,127,255,0.7)' }}>
            "{searchTerm}"
          </span>
        </p>
      )}
    </div>
  );
};

export default EmptyState;