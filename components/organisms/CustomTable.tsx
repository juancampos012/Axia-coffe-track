'use client'

import React, { useState, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { FilePenLine, Eye, Trash2, CheckCircle, Clock, Download, Printer, MoreVertical } from "lucide-react"; 

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
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  condition?: (item: any) => boolean;
  showCondition?: (item: any) => boolean;
}

interface StatusColumnConfig {
  key: string;
  statusMap: {
    [key: string]: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  };
}

interface CustomTableProps {
  title: string;
  headers: HeaderItem[];
  options?: boolean;
  data?: { [key: string]: any }[];
  onRowClick?: (id: string) => void;
  contextType?: 'clients' | 'employees' | 'products' | 'suppliers' | 'invoices' | 'purchase' | 'loan';
  customActions?: {
    edit?: (id: string) => void;
    view?: (id: string) => void;
    delete?: (id: string) => void;
    custom?: CustomAction[];
  };
  actionLabels?: {
    edit?: string;
    view?: string;
    delete?: string;
  };
  statusColumn?: StatusColumnConfig;
  showDetails?: (item: any) => ReactNode;
  onRowDoubleClick?: (item: any) => void;
}

export default function CustomTable({ 
  title, 
  headers,
  options, 
  data = [], 
  contextType = 'products',
  customActions,
  actionLabels,
  statusColumn,
  showDetails,
  onRowDoubleClick
}: CustomTableProps) {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const t = useTranslations("CustomTable");
  const itemsPerPage = 10;

  const handleToggle = (index: number) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const handleEdit = (id: string) => {
    if (customActions?.edit) {
      customActions.edit(id);
    } else {
      console.log(`Editing ${contextType} with ID:`, id);
    }
  };

  const handleView = (id: string) => {
    if (customActions?.view) {
      customActions.view(id);
    } else {
      console.log(`Viewing ${contextType} with ID:`, id);
    }
  };

  const handleDelete = (id: string) => {
    if (customActions?.delete) {
      if (confirm(`${t('delete_confirmation') + t(contextType)}?`)) {
        customActions.delete(id);
      }
    } else {
      console.log(`Delete action triggered for ${contextType} with ID:`, id);
    }
  };

  const handleRowClick = (index: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleRowDoubleClick = (item: any) => {
    if (onRowDoubleClick) {
      onRowDoubleClick(item);
    } else if (customActions?.view) {
      customActions.view(item.id);
    }
  };

  const getStatusColor = (statusValue: string): string => {
    if (!statusColumn || !statusColumn.statusMap[statusValue]) return 'bg-gray-100 text-gray-800';
    
    const colorMap = {
      green: 'bg-green-100 text-green-800 border border-green-300',
      yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      red: 'bg-red-100 text-red-800 border border-red-300',
      blue: 'bg-blue-100 text-blue-800 border border-blue-300',
      gray: 'bg-gray-100 text-gray-800 border border-gray-300',
    };
    
    return colorMap[statusColumn.statusMap[statusValue]];
  };

  const getStatusIcon = (statusValue: string): ReactNode => {
    if (!statusColumn) return null;
    
    const statusIcons: { [key: string]: ReactNode } = {
      green: <CheckCircle className="w-4 h-4" />,
      yellow: <Clock className="w-4 h-4" />,
      red: <div className="w-4 h-4 rounded-full bg-red-500" />,
    };
    
    return statusIcons[statusColumn.statusMap[statusValue]];
  };

  const getCustomActions = (item: any): CustomAction[] => {
    if (!customActions?.custom) return [];
    
    return customActions.custom.filter(action => {
      if (action.condition) return action.condition(item);
      if (action.showCondition) return action.showCondition(item);
      return true;
    });
  };

  const renderCustomIcon = (icon: string | ReactNode): ReactNode => {
    if (typeof icon === 'string') {
      const iconMap: { [key: string]: ReactNode } = {
        '💰': <span className="text-xl">💰</span>,
        '⏳': <span className="text-xl">⏳</span>,
        '📄': <span className="text-xl">📄</span>,
        '🖨️': <Printer className="w-4 h-4" />,
        '📥': <Download className="w-4 h-4" />,
        '✅': <CheckCircle className="w-4 h-4 text-green-500" />,
      };
      return iconMap[icon] || <span className="text-lg">{icon}</span>;
    }
    return icon;
  };

  const getColorClasses = (color?: string): string => {
    const colorMap: { [key: string]: string } = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600',
      gray: 'text-gray-600',
    };
    return colorMap[color || 'gray'] || 'text-gray-600';
  };

  const safeData = Array.isArray(data) ? data : [];
  const totalPages = Math.ceil(safeData.length / itemsPerPage);
  const paginatedData = safeData.slice(
    (currentPage - 1) * itemsPerPage, 
    Math.min(currentPage * itemsPerPage, safeData.length)
  );

  const labels = actionLabels || {
    edit: t(`edit.${contextType}`) || t('edit.default'),
    view: t(`view.${contextType}`) || t('view.default'),
    delete: t(`delete.${contextType}`) || t('delete.default'),
  };

  const buildDropdownOptions = (item: any) => {
    const options = [];
    
    // Agregar opción de editar si está disponible
    if (customActions?.edit !== undefined && contextType !== 'invoices') {
      options.push({
        text: labels.edit || 'Edit',
        icon: <FilePenLine size={18} className={getColorClasses('blue')} />,
        action: () => handleEdit(item.id)
      });
    }
    
    // Agregar opción de ver si está disponible
    if (customActions?.view !== undefined) {
      options.push({
        text: labels.view || 'View', 
        icon: <Eye size={18} className={getColorClasses('gray')} />,
        action: () => handleView(item.id)
      });
    }
    
    // Agregar acciones personalizadas
    const customActionsList = getCustomActions(item);
    customActionsList.forEach(action => {
      options.push({
        text: action.label,
        icon: renderCustomIcon(action.icon),
        action: () => action.action(item.id)
      });
    });
    
    // Agregar opción de eliminar si está disponible
    if (customActions?.delete !== undefined) {
      options.push({
        text: labels.delete || 'Delete', 
        icon: <Trash2 size={18} className={getColorClasses('red')} />,
        action: () => handleDelete(item.id)
      });
    }
    
    return options;
  };

  return (
    <div className="relative w-full text-white">
      <div className="relative w-full bg-transparent rounded-lg shadow-lg p-4">
        {title && (
          <h2 className="text-2xl font-semibold p-4 border-b text-white mb-4">{title}</h2>
        )}

        <div className="overflow-x-auto pb-10">
          <table className="w-full border-collapse table-fixed">
            <thead className="bg-transparent border-b border-gray-700">
              <tr>
                {headers.map((header, index) => (
                  <th 
                    key={index} 
                    className="p-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      {header.label}
                      {header.sortable && (
                        <button className="ml-1 text-gray-400 hover:text-white">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                {options && (
                  <th className="p-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                    {t('options')}
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={headers.length + (options ? 1 : 0)} 
                    className="p-8 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-5xl mb-4">📄</div>
                      <p className="text-lg">{}</p>
                      <p className="text-sm mt-2">{}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index;
                  const isExpanded = expandedRows.has(globalIndex);

                  return (
                    <React.Fragment key={globalIndex}>
                      <tr 
                        className={`border-b border-gray-700 hover:bg-gray-800/50 transition-colors ${onRowDoubleClick ? 'cursor-pointer' : ''}`}
                        onDoubleClick={() => onRowDoubleClick && handleRowDoubleClick(item)}
                        onClick={() => showDetails && handleRowClick(globalIndex)}
                      >
                        {headers.map((header, idx) => (
                          <td key={idx} className="p-3 text-gray-300">
                            {header.key === statusColumn?.key ? (
                              <div className="flex items-center">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item[header.key])}`}>
                                  {getStatusIcon(item[header.key]) && (
                                    <span className="mr-2">{getStatusIcon(item[header.key])}</span>
                                  )}
                                  {item[header.key] || '-'}
                                </span>
                              </div>
                            ) : (
                              <div className="truncate" title={String(item[header.key] || '-')}>
                                {item[header.key] || '-'}
                              </div>
                            )}
                          </td>
                        ))}
                        
                        {options && (
                          <td className="p-3 text-gray-300 relative" onClick={(e) => e.stopPropagation()}>
                            <Dropdown
                              icon={<MoreVertical color="white" size={20} />}
                              options={buildDropdownOptions(item)}
                              useIconButton={true}
                              isOpen={openDropdown === globalIndex}
                              onToggle={() => handleToggle(globalIndex)}
                              isLastItem={globalIndex === safeData.length - 1}
                            />
                          </td>
                        )}
                      </tr>
                      
                      {/* Expanded details row */}
                      {isExpanded && showDetails && (
                        <tr className="bg-gray-900/50 border-b border-gray-700">
                          <td colSpan={headers.length + (options ? 1 : 0)} className="p-4">
                            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-sm font-medium text-gray-300">Detalles adicionales</h4>
                                <button 
                                  onClick={() => handleRowClick(globalIndex)}
                                  className="text-gray-400 hover:text-white text-sm"
                                >
                                  Cerrar
                                </button>
                              </div>
                              {showDetails(item)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-700 gap-4">
            <div className="text-sm text-gray-400">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, safeData.length)} de {safeData.length} registros
            </div>
            
            <div className="flex items-center gap-2">
              <CustomButton
                text={t('previous')}
                onClickButton={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                style="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                typeButton="button"
                disabled={currentPage === 1}
              />
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded text-sm ${currentPage === pageNum 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="text-gray-400 mx-1">...</span>
                )}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 rounded text-sm ${currentPage === totalPages 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {totalPages}
                  </button>
                )}
              </div>
              
              <CustomButton
                text={t('next')}
                onClickButton={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                style="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                typeButton="button"
                disabled={currentPage === totalPages}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}