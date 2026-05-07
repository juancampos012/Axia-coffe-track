'use client'

import React, { useState, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { FilePenLine, Eye, Trash2, MoreVertical } from "lucide-react"; 

import Dropdown from "../molecules/Dropdown";
import CustomButton from "../atoms/CustomButton";

interface HeaderItem {
  label: string;
  key: string;
  sortable?: boolean;
}

interface CustomAction {
  label: string;
  action: (id: string) => void;
  icon: string | ReactNode;
  condition?: (item: any) => boolean;
}

interface CustomTableProps {
  title?: string;
  headers: HeaderItem[];
  options?: boolean;
  data?: { [key: string]: any }[];
  contextType?: 'clients' | 'employees' | 'products' | 'suppliers' | 'invoices' | 'purchase' | 'loan';
  customActions?: {
    edit?: (id: string) => void;
    view?: (id: string) => void;
    delete?: (id: string) => void;
    custom?: CustomAction[];
  };
  actionLabels?: { edit?: string; view?: string; delete?: string; };
  statusColumn?: { key: string; statusMap: { [key: string]: string } };
  showDetails?: (item: any) => ReactNode;
  onRowDoubleClick?: (item: any) => void;
}

export default function CustomTable({ 
  title, headers, options, data = [], contextType = 'products', 
  customActions, actionLabels, statusColumn, showDetails, onRowDoubleClick 
}: CustomTableProps) {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const t = useTranslations("CustomTable");
  const itemsPerPage = 10;

  const labels = {
    edit: actionLabels?.edit || t(`edit.${contextType}`) || "Editar",
    view: actionLabels?.view || t(`view.${contextType}`) || "Ver",
    delete: actionLabels?.delete || t(`delete.${contextType}`) || "Eliminar",
  };

  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="w-full">
      <div className="w-full bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 overflow-visible shadow-xl">
        {title && <div className="p-6 border-b border-zinc-800"><h2 className="text-xl font-bold text-white">{title}</h2></div>}

        {/* CONTENEDOR CLAVE: min-h y overflow visible para que el dropdown no se corte */}
        <div className="relative overflow-visible min-h-[450px]">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-zinc-900/20">
                {headers.map((h, i) => (
                  <th key={i} className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-800">{h.label}</th>
                ))}
                {options && <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-500 border-b border-zinc-800">{t('options')}</th>}
              </tr>
            </thead>
            <tbody className="overflow-visible">
              {paginatedData.map((item, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index;
                // Z-INDEX INVERSO: La primera fila tiene Z mas alto que la segunda
                const zIndexStyle = { zIndex: paginatedData.length - index };

                return (
                  <React.Fragment key={globalIndex}>
                    <tr 
                      style={zIndexStyle}
                      className="relative group hover:bg-zinc-800/30 transition-colors duration-150"
                      onDoubleClick={() => onRowDoubleClick?.(item)}
                    >
                      {headers.map((h, idx) => (
                        <td key={idx} className="px-6 py-4 text-sm text-zinc-300 border-b border-zinc-800/50 truncate max-w-[200px]">
                          {item[h.key] || '-'}
                        </td>
                      ))}
                      {options && (
                        <td className="px-6 py-4 text-right border-b border-zinc-800/50 overflow-visible">
                          <Dropdown
                            icon={<MoreVertical size={18} />}
                            isOpen={openDropdown === globalIndex}
                            onToggle={() => setOpenDropdown(openDropdown === globalIndex ? null : globalIndex)}
                            useIconButton={true}
                            className="inline-block"
                            isLastItem={index > paginatedData.length - 3 && paginatedData.length > 3} // Si es de los últimos, abre hacia arriba
                            options={[
                                ...(customActions?.edit ? [{ text: labels.edit, icon: <FilePenLine size={16} className="text-blue-400" />, action: () => customActions.edit?.(item.id) }] : []),
                                ...(customActions?.view ? [{ text: labels.view, icon: <Eye size={16} className="text-zinc-400" />, action: () => customActions.view?.(item.id) }] : []),
                                ...(customActions?.delete ? [{ text: labels.delete, icon: <Trash2 size={16} className="text-red-400" />, action: () => customActions.delete?.(item.id) }] : []),
                            ]}
                          />
                        </td>
                      )}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Paginación simple */}
        {totalPages > 1 && (
            <div className="p-4 border-t border-zinc-800 flex justify-end gap-2">
                <CustomButton text="Anterior" disabled={currentPage === 1} onClickButton={() => setCurrentPage(p => p - 1)} style="bg-zinc-800 text-white px-4 py-1 rounded-lg" />
                <CustomButton text="Siguiente" disabled={currentPage === totalPages} onClickButton={() => setCurrentPage(p => p + 1)} style="bg-homePrimary text-white px-4 py-1 rounded-lg" />
            </div>
        )}
      </div>
    </div>
  );
}