import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface HeaderItem {
  label: string;
  key: string;
}

interface TableFilterProps {
  headers: HeaderItem[];
  onSort: (field: string, direction: 'asc' | 'desc') => void;
}

const TableFilter: React.FC<TableFilterProps> = ({ headers, onSort }) => {
  const t = useTranslations("TableFilter");
  const [isOpen, setIsOpen] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const ref = useRef<HTMLDivElement>(null);

  // Cierra al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSort = (field: string) => {
    const newDir = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDir);
    onSort(field, newDir);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
        style={{
          background: isOpen ? 'rgba(30,60,139,0.25)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isOpen ? 'rgba(74,127,255,0.45)' : 'rgba(255,255,255,0.08)'}`,
          color: isOpen ? '#fff' : 'rgba(255,255,255,0.5)',
          fontFamily: 'Syne, sans-serif',
        }}
        onMouseEnter={e => {
          if (!isOpen) {
            e.currentTarget.style.background = 'rgba(30,60,139,0.15)';
            e.currentTarget.style.borderColor = 'rgba(30,60,139,0.4)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
          }
        }}
        onMouseLeave={e => {
          if (!isOpen) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }
        }}
      >
        <SlidersHorizontal size={14} />
        {t("filter")}
        {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-52 rounded-xl overflow-hidden"
          style={{
            background: 'rgba(8,12,28,0.97)',
            border: '1px solid rgba(30,60,139,0.35)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(30,60,139,0.1)',
          }}
        >
          {/* Header del dropdown */}
          <div
            className="px-4 py-2.5 border-b"
            style={{ borderColor: 'rgba(30,60,139,0.2)' }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: 'rgba(74,127,255,0.7)' }}>
              Ordenar por
            </span>
          </div>

          <div className="py-1">
            {headers.map(({ label, key }) => {
              const isActive = sortField === key.toLowerCase();
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSort(key.toLowerCase())}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150"
                  style={{
                    background: isActive ? 'rgba(30,60,139,0.2)' : 'transparent',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(30,60,139,0.12)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = isActive ? '#fff' : 'rgba(255,255,255,0.5)';
                  }}
                >
                  <span>{label}</span>
                  {isActive && (
                    <span style={{ color: '#4a7fff', fontSize: 13, fontWeight: 700 }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableFilter;