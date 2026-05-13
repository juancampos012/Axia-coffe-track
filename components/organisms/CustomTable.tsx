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
        className="w-full rounded-2xl overflow-visible shadow-xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(30,60,139,0.25)",
          backdropFilter: "blur(12px)",
        }}
      >
        {title && (
          <div
            className="px-6 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <h2
              className="text-lg font-bold text-white"
              style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.02em" }}
            >
              {title}
            </h2>
          </div>
        )}

        <div className="relative overflow-visible min-h-[420px]">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest"
                    style={{
                      color: "rgba(74,127,255,0.7)",
                      borderBottom: "1px solid rgba(30,60,139,0.25)",
                      background: "rgba(30,60,139,0.08)",
                    }}
                  >
                    {h.label}
                  </th>
                ))}
                {options && (
                  <th
                    className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-widest"
                    style={{
                      color: "rgba(74,127,255,0.7)",
                      borderBottom: "1px solid rgba(30,60,139,0.25)",
                      background: "rgba(30,60,139,0.08)",
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
                const zIndexStyle = { zIndex: paginatedData.length - index };
                const isLast = index === paginatedData.length - 1;

                return (
                  <React.Fragment key={globalIndex}>
                    <tr
                      style={zIndexStyle}
                      className="relative group transition-colors duration-150 cursor-default"
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(30,60,139,0.08)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      onDoubleClick={() => onRowDoubleClick?.(item)}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,60,139,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {headers.map((h, idx) => (
                        <td
                          key={idx}
                          className="px-6 py-4 text-sm truncate max-w-[200px]"
                          style={{
                            color: "rgba(255,255,255,0.65)",
                            borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          {item[h.key] || '-'}
                        </td>
                      ))}
                      {options && (
                        <td
                          className="px-6 py-4 text-right overflow-visible"
                          style={{
                            borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          <Dropdown
                            icon={<MoreVertical size={16} />}
                            isOpen={openDropdown === globalIndex}
                            onToggle={() =>
                              setOpenDropdown(openDropdown === globalIndex ? null : globalIndex)
                            }
                            useIconButton={true}
                            className="inline-block"
                            isLastItem={
                              index > paginatedData.length - 3 && paginatedData.length > 3
                            }
                            options={[
                              ...(customActions?.edit
                                ? [{ text: labels.edit, icon: <FilePenLine size={14} className="text-[#4a7fff]" />, action: () => customActions.edit?.(item.id) }]
                                : []),
                              ...(customActions?.view
                                ? [{ text: labels.view, icon: <Eye size={14} className="text-white/40" />, action: () => customActions.view?.(item.id) }]
                                : []),
                              ...(customActions?.delete
                                ? [{ text: labels.delete, icon: <Trash2 size={14} className="text-red-400" />, action: () => customActions.delete?.(item.id) }]
                                : []),
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
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <ChevronLeft size={14} /> Anterior
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-white"
                style={{ background: "linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)" }}
              >
                Siguiente <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
