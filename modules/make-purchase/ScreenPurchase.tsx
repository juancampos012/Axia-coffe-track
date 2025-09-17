"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import Image from "next/image";

import SearchBarUniversal from "@/components/molecules/SearchBar";
import Input from "@/components/atoms/Input";
import { createDeposit } from "@/request/deposit";
import { useBalance } from "@/context/BalanceContext"; 

function formatWithDots(value: string) {
  const onlyNumbers = value.replace(/\D/g, "");
  return onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function ScreenPurchase() {
  const { balance, setBalance } = useBalance(); 

  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
  const [quantityText, setQuantityText] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const t = useTranslations("purchase");

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    const cleaned = input.replace(/\D/g, "");

    if (cleaned === "") {
      setQuantityText("");
      setQuantity(0);
      return;
    }

    setQuantityText(formatWithDots(cleaned));
    setQuantity(parseInt(cleaned, 10));
  };

  const handleCreateDeposit = async () => {
    if (!selectedSupplier) {
      alert("Por favor, selecciona un proveedor.");
      return;
    }

    if (!quantity || quantity <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    try {
      setLoading(true);

      await createDeposit({
        supplierId: selectedSupplier,
        amount: quantity,
      });

      if (balance !== null) {
        setBalance(balance + quantity);
      } else {
        setBalance(quantity);
      }
      
      setQuantityText("");
      setQuantity(0);
      alert("Ingreso creado correctamente.");
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al crear ingreso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white flex justify-center">

      <div className="relative w-full my-6 bg-blac bg-opacity-50 rounded-lg shadow-lg mt-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Ingresos</h2>  
        </div>

        <div className="flex flex-row gap-6 flex-wrap mt-12">
          <div className="flex-1 min-w-[300px] border border-gray-600 bg-transparent p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-white">Añadir ingreso</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col w-full">
                <label className="mb-1 text-sm font-medium text-white">{t("supplierLabel")}</label>
                <SearchBarUniversal 
                  onAddToCart={(item) => {
                    const supplier = item as any;
                    setSelectedSupplier(supplier.id);
                  }} 
                  showResults={true}
                  placeholder={t("supplierPlaceholder")}
                  searchType="suppliers"
                />
              </div>

              <div className="flex flex-row space-x-7">
                <div className="flex flex-col w-full">
                  <label className="mb-1 text-sm font-medium text-white">{t("quantityLabel")}</label>
                  <Input
                    type="text"
                    value={quantityText}
                    onChange={handleQuantityChange}
                    placeholder={t("quantityPlaceholder")}
                  />
                </div>
              </div>

              <button
                className="px-6 py-2 bg-homePrimary border text-white rounded-md hover:bg-homePrimary-400 disabled:bg-gray-500 transition-colors w-full"
                onClick={handleCreateDeposit}
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear Ingreso"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
