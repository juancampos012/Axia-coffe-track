"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, X, Loader2 } from "lucide-react";

import { getListClientsByName } from "@/lib/api-clients";
import { getListproductsByName } from "@/lib/api-products";
import { getListEmployeesByName } from "@/lib/api-employees";
import { getListSuppliersByName } from "@/lib/api-suppliers";
import { 
  ProductDAO, 
  EmployeeDAO, 
  SupplierDAO, 
  ClientDAO, 
  CreatedInvoice
} from "@/types/Api";
import { useTranslations } from "next-intl";
import { getListInvoicesByClientName } from "@/lib/api-saleInvoce";

interface SearchBarUniversalProps {
  onResultsFound?: (results: ProductDAO[] | EmployeeDAO[] | SupplierDAO[] | ClientDAO[] | CreatedInvoice[]) => void;
  onAddToCart?: (item: ProductDAO | ClientDAO | SupplierDAO | EmployeeDAO) => void;
  onSearchTermChange?: (term: string) => void;
  disabled?: boolean;
  showResults?: boolean;
  resetTrigger?: number;
  placeholder?: string;
  supplierIdFilter?: string | null; 
  searchType: "employees" | "products" | "suppliers" | "clients" | "invoices";
}

function debounce<U extends unknown[], R>(
  func: (...args: U) => R,
  wait: number
): (...args: U) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: U): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const SearchBarUniversal: React.FC<SearchBarUniversalProps> = ({
  onResultsFound,
  onAddToCart,
  onSearchTermChange,
  showResults = false,
  placeholder = "Buscar...",
  disabled,
  searchType,
  resetTrigger,
  supplierIdFilter
}) => {
  const [showResultsInternal, setShowResultsInternal] = useState(showResults);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<(ProductDAO | EmployeeDAO | SupplierDAO | ClientDAO | CreatedInvoice)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("searchBar");

  useEffect(() => {
    if (searchTerm === "") {
      setResults([]);
      if (onResultsFound) onResultsFound([]);
    }
  }, [searchTerm, onResultsFound]);

  useEffect(() => {
    if (resetTrigger !== undefined) {
      setSearchTerm("");
      setResults([]);
      setShowResultsInternal(false);
    }
  }, [resetTrigger]);

  const debounceSearch = useMemo(
    () =>
      debounce(async (term: string) => {
        if (!term || term.length < 2) {
          setResults([]);
          if (onResultsFound) onResultsFound([]);
          return;
        }

        setIsLoading(true);
        setError(null);

        try {
          let fetchedResults: ProductDAO[] | EmployeeDAO[] | SupplierDAO[] | ClientDAO[] | CreatedInvoice[] = [];
          
          if (searchType === "products") {
            fetchedResults = await getListproductsByName(term) || [];
            if (supplierIdFilter){
              fetchedResults = fetchedResults.filter((product) => product.supplier?.id === supplierIdFilter);
            }
          } else if (searchType === "clients") {
            fetchedResults = (await getListClientsByName(term)) || [];
          } else if (searchType === "suppliers") {
            fetchedResults = await getListSuppliersByName(term) || [];
          } else if (searchType === "invoices") {
            fetchedResults = await getListInvoicesByClientName(term) || [];
          } else {
            fetchedResults = await getListEmployeesByName(term) || [];
          }

          setResults(fetchedResults);

          if (fetchedResults.length === 0) {
            setError("No se encontraron resultados");
          } else {
            setError(null);
          }

          if (onResultsFound) onResultsFound(fetchedResults);
        
        } catch (err) {
          console.error("Error fetching results:", err);
          setError("Error al buscar");
          setResults([]);
          if (onResultsFound) onResultsFound([]);
        
        } finally {
          setIsLoading(false);
        }
      }, 400),
    [onResultsFound, searchType, supplierIdFilter]
  );

  useEffect(() => {
    debounceSearch(searchTerm);
  }, [searchTerm, debounceSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (showResults) {
      setShowResultsInternal(true);
    }

    if (onSearchTermChange) onSearchTermChange(term);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setResults([]);
    setShowResultsInternal(false);
  };

  return (
    <div className="w-full relative">
      {/* Input de búsqueda */}
      <div className="relative flex items-center">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(74,127,255,0.5)" }} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          disabled={disabled}
          onChange={handleSearch}
          className="w-full pl-11 pr-12 py-3 rounded-xl text-white text-sm outline-none transition-all disabled:cursor-not-allowed"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(30,60,139,0.35)",
          color: "white",
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = "1px solid rgba(74,127,255,0.6)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(74,127,255,0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = "1px solid rgba(30,60,139,0.35)";
          e.currentTarget.style.boxShadow = "none";
        }}
        />

        {/* Loading o Clear button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 size={20} className="text-blue-400 animate-spin" />
          ) : searchTerm ? (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Resultados */}
      {showResultsInternal && searchTerm && (
        <div className="absolute z-50 w-full mt-2 rounded-xl shadow-2xl overflow-hidden" style={{ background: "rgba(4,6,18,0.97)", border: "1px solid rgba(30,60,139,0.4)", backdropFilter: "blur(20px)" }}>
          {error ? (
            <div className="p-4 text-center">
              <p className="text-gray-400 text-sm">😕 {error}</p>
            </div>
          ) : results.length > 0 ? (
            <div className="overflow-y-auto max-h-[240px]">
              {results.map((item, index) => (
                <div
                  key={(item as any).id}
                  className={`flex justify-between items-center p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                    index !== results.length - 1 ? 'border-b border-white/[0.05]' : ''
                  }`}
                  onClick={() => {
                    if (onAddToCart && (searchType === "products" || searchType === "clients" || searchType === "suppliers")) {
                      onAddToCart(item as any);
                      const name =
                        (item as ProductDAO).name ||
                        (item as EmployeeDAO).name ||
                        (item as SupplierDAO).name ||
                        `${(item as ClientDAO).firstName} ${(item as ClientDAO).lastName}`;
                      setSearchTerm(name);
                      setShowResultsInternal(false);
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {(item as ProductDAO).name || 
                       (item as EmployeeDAO).name || 
                       (item as SupplierDAO).name || 
                       `${(item as ClientDAO).firstName} ${(item as ClientDAO).lastName}`}
                    </p>

                    <div className="text-sm text-gray-400 mt-1">
                      {searchType === "products" ? (
                        <span>Producto</span>
                      ) : searchType === "employees" ? (
                        <span>{(item as EmployeeDAO).email}</span>
                      ) : searchType === "clients" ? (
                        <span>
                          {(item as ClientDAO).email || (item as ClientDAO).identification}
                        </span>
                      ) : searchType === "suppliers" ? (
                        <span>NIT: {(item as SupplierDAO).nit}</span>
                      ) : null}
                    </div>
                  </div>

                  {(onAddToCart && (searchType === "products" || searchType === "clients" || searchType === "suppliers")) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(item as any);
                        const name =
                          (item as ProductDAO).name ||
                          (item as EmployeeDAO).name ||
                          (item as SupplierDAO).name ||
                          `${(item as ClientDAO).firstName} ${(item as ClientDAO).lastName}`;
                        setSearchTerm(name);
                        setShowResultsInternal(false);
                      }}
                      className="ml-4 px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition-all duration-200 hover:opacity-90 flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)" }}
                    >
                      Seleccionar
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="p-4 text-center">
                <p className="text-gray-400 text-sm">🔍 Escribe al menos 2 caracteres para buscar</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBarUniversal;