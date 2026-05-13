'use client'

import React, { useState, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { FilePenLine, Eye, Trash2, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import Dropdown from "../molecules/Dropdown";

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
      <div
        className="w-full rounded-2xl overflow-visible"
        style={{
          background: 'rgba(8,12,28,0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(30,60,139,0.2)',
        }}
      >
        {/* Título */}
        {title && (
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: 'rgba(30,60,139,0.2)' }}
          >
            <h2
              className="text-lg font-bold text-white"
              style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em' }}
            >
              {title}
            </h2>
          </div>
        )}

        {/* Tabla */}
        <div className="relative overflow-visible min-h-[400px]">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-[0.1em] border-b"
                    style={{
                      color: 'rgba(74,127,255,0.6)',
                      borderColor: 'rgba(30,60,139,0.2)',
                      background: 'rgba(30,60,139,0.06)',
                    }}
                  >
                    {h.label}
                  </th>
                ))}
                {options && (
                  <th
                    className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-[0.1em] border-b"
                    style={{
                      color: 'rgba(74,127,255,0.6)',
                      borderColor: 'rgba(30,60,139,0.2)',
                      background: 'rgba(30,60,139,0.06)',
                    }}
                  >
                    {t('options')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="overflow-visible">
              {paginatedData.map((item, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index;
                const isLast = index === paginatedData.length - 1;

                return (
                  <React.Fragment key={globalIndex}>
                    <tr
                      style={{ zIndex: paginatedData.length - index, position: 'relative' }}
                      className="group transition-colors duration-150"
                      onDoubleClick={() => onRowDoubleClick?.(item)}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,60,139,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {headers.map((h, idx) => (
                        <td
                          key={idx}
                          className="px-6 py-4 text-sm truncate max-w-[200px]"
                          style={{
                            color: 'rgba(255,255,255,0.65)',
                            borderBottom: isLast ? 'none' : '1px solid rgba(30,60,139,0.12)',
                          }}
                        >
                          {item[h.key] || '—'}
                        </td>
                      ))}
                      {options && (
                        <td
                          className="px-6 py-4 text-right overflow-visible"
                          style={{
                            borderBottom: isLast ? 'none' : '1px solid rgba(30,60,139,0.12)',
                          }}
                        >
                          <Dropdown
                            icon={
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
                                style={{
                                  background: openDropdown === globalIndex ? 'rgba(30,60,139,0.3)' : 'transparent',
                                  border: openDropdown === globalIndex ? '1px solid rgba(74,127,255,0.3)' : '1px solid transparent',
                                }}
                              >
                                <MoreVertical size={15} style={{ color: 'rgba(255,255,255,0.5)' }} />
                              </div>
                            }
                            isOpen={openDropdown === globalIndex}
                            onToggle={() => setOpenDropdown(openDropdown === globalIndex ? null : globalIndex)}
                            useIconButton={true}
                            className="inline-block"
                            isLastItem={index > paginatedData.length - 3 && paginatedData.length > 3}
                            options={[
                              ...(customActions?.edit ? [{ text: labels.edit, icon: <FilePenLine size={14} style={{ color: '#4a7fff' }} />, action: () => customActions.edit?.(item.id) }] : []),
                              ...(customActions?.view ? [{ text: labels.view, icon: <Eye size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />, action: () => customActions.view?.(item.id) }] : []),
                              ...(customActions?.delete ? [{ text: labels.delete, icon: <Trash2 size={14} style={{ color: '#f87171' }} />, action: () => customActions.delete?.(item.id) }] : []),
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div
            className="px-6 py-4 flex items-center justify-between border-t"
            style={{ borderColor: 'rgba(30,60,139,0.2)' }}
          >
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                style={{
                  background: currentPage === 1 ? 'rgba(255,255,255,0.03)' : 'rgba(30,60,139,0.15)',
                  border: '1px solid rgba(30,60,139,0.2)',
                  color: currentPage === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={13} /> Anterior
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                style={{
                  background: currentPage === totalPages
                    ? 'rgba(255,255,255,0.03)'
                    : 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)',
                  border: '1px solid rgba(30,60,139,0.3)',
                  color: currentPage === totalPages ? 'rgba(255,255,255,0.2)' : '#fff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  boxShadow: currentPage === totalPages ? 'none' : '0 2px 10px rgba(30,60,139,0.3)',
                }}
              >
                Siguiente <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}