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
  icon = <SearchX size={32} style={{ color: "rgba(74,127,255,0.4)" }} />,
}) => {
  const t = useTranslations("searchBar");

  return (
    <div
      className="w-full py-14 flex flex-col items-center justify-center rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px dashed rgba(30,60,139,0.35)",
      }}
    >
      <div className="mb-4 p-4 rounded-full" style={{ background: "rgba(30,60,139,0.12)" }}>
        {icon}
      </div>
      <h3
        className="text-sm font-semibold mb-1"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        {message}
      </h3>
      {searchTerm && (
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          {t("noResultsFor")}{" "}
          <span style={{ color: "rgba(74,127,255,0.7)" }}>"{searchTerm}"</span>
        </p>
      )}
    </div>
  );
};

export default EmptyState;
