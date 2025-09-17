"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";

import Input from "@/components/atoms/Input";
import { getListClientsByName } from "@/lib/api-clients";
import CustomButton from "@/components/atoms/CustomButton";
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
            setError("No se encontraron resultados para la búsqueda.");
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
      }, 500),
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

  return (
    <div className="w-full">

      <div className="relative">
        <Input
          icon={Search}
          placeholder={placeholder}
          value={searchTerm}
          disable={disabled}
          onChange={handleSearch}
        />
      </div>

      {showResultsInternal && (
        <div className="mt-2">
          {isLoading && <p className="text-gray-500 text-sm">{t("searching")}</p>}
          
          {error && <p className="text-yellow-600 text-sm">{t("error")}</p>}

          {searchTerm && results.length > 0 ? (
            <ul className="bg-black border border-gray-300 rounded-md shadow-sm max-h-60 overflow-auto">
              {results.map((item) => (
                <li
                  key={(item as any).id}
                  className="flex justify-between items-center p-2 border-b hover:bg-gray-700"
                >
                  <div>
                    <span className="font-medium text-white">
                      {(item as ProductDAO).name || 
                       (item as EmployeeDAO).name || 
                       (item as SupplierDAO).name || 
                       `${(item as ClientDAO).firstName} ${(item as ClientDAO).lastName}`}
                    </span>

                    <div className="text-sm text-gray-500">
                      {searchType === "products" ? (
                        <>
                        </>
                      ) : searchType === "employees" ? (
                        <>
                          <span>Posición: {(item as EmployeeDAO).id}</span>
                          <span className="ml-2">Email: {(item as EmployeeDAO).email}</span>
                        </>
                      ) : searchType === "clients" ? (
                        <>
                          <span>Email: {(item as ClientDAO).email}</span>
                          <span className="ml-2">ID: {(item as ClientDAO).identification}</span>
                        </>
                      ) : (
                        <>
                          <span>NIT: {(item as SupplierDAO).nit}</span>
                          <span className="ml-2">Teléfono: {(item as SupplierDAO).phone}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {(onAddToCart && (searchType === "products" || searchType === "clients" || searchType === "suppliers")) && (
                    <CustomButton
                      text="Agregar"
                      style="c text-white hover:bg-homePrimary-400 text-sm px-3 py-1"
                      onClickButton={() => {
                        onAddToCart?.(item as any);

                        const name =
                          (item as ProductDAO).name ||
                          (item as EmployeeDAO).name ||
                          (item as SupplierDAO).name ||
                          `${(item as ClientDAO).firstName} ${(item as ClientDAO).lastName}`;

                        setSearchTerm(name);

                        if (showResults) {
                          setShowResultsInternal(false);
                        }
                      }}
                    />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            searchTerm && !isLoading && !error && 
            <p className="text-gray-500 text-sm">{t("noResults")}</p>
          )}
        </div>
      )}
      
    </div>
  );
};

export default SearchBarUniversal;