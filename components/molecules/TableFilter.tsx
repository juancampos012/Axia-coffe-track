import React, { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

interface HeaderItem {
  label: string;
  key: string;
}

interface TableFilterProps {
  headers: HeaderItem[];
  onSort: (field: string, direction: "asc" | "desc") => void;
}

const TableFilter: React.FC<TableFilterProps> = ({ headers, onSort }) => {
  const t = useTranslations("TableFilter");
  const [isOpen, setIsOpen] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: string) => {
    const newDirection =
      field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDir);
    onSort(field, newDir);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(30,60,139,0.35)",
          color: "rgba(255,255,255,0.5)",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <SlidersHorizontal size={15} style={{ color: "rgba(74,127,255,0.7)" }} />
        {t("filter")}
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 z-50 mt-2 w-52 rounded-xl py-1.5 shadow-2xl"
            style={{
              background: "rgba(4,6,18,0.97)",
              border: "1px solid rgba(30,60,139,0.4)",
              backdropFilter: "blur(20px)",
            }}
          >
            {headers.map(({ label, key }) => (
              <button
                key={key}
                className="flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                style={{
                  color:
                    sortField === key.toLowerCase()
                      ? "rgba(74,127,255,0.9)"
                      : "rgba(255,255,255,0.5)",
                }}
                onClick={() => handleSort(key.toLowerCase())}
              >
                <span>{label}</span>
                {sortField === key.toLowerCase() && (
                  <span className="text-xs" style={{ color: "#4a7fff" }}>
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TableFilter;
