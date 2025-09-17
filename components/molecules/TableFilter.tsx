import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface HeaderItem {
  label: string; // texto visible, traducido
  key: string;   // clave de acceso a los datos (en inglés, como en la DB)
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

  const handleSort = (field: string) => {
    // Si se selecciona el mismo campo, se cambia la dirección, si no, se pone ascendente
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    onSort(field, newDirection);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter className="h-5 w-5 text-gray-400" aria-hidden="true" />
          {t("filter")}
          {isOpen ? (
            <ChevronUp className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-1" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {headers.map(({label, key}) => (
              <a
                key={key}
                href="#"
                className={`block px-4 py-2 text-sm ${sortField === key.toLowerCase() ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSort(key.toLowerCase());
                }}
              >
                {label}
                {sortField === key.toLowerCase() && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableFilter;