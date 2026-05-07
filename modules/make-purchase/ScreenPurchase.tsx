"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Wallet, UserPlus, ArrowUpRight, Loader2 } from "lucide-react";

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
        setBalance(Number(balance) + Number(quantity));
      } else {
        setBalance(Number(quantity));
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
    <div className="w-full min-h-screen bg-[#0a1120] p-6 text-slate-200 font-sans flex flex-col items-center">
      <div className="max-w-[800px] w-full space-y-8">
        
        {/* CABECERA */}
        <div className="flex justify-between items-center bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-md">
          <div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
              <Wallet className="text-blue-500" size={32} />
              Ingresos<span className="text-blue-500">.</span>
            </h2>
            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-1">Carga manual de capital al sistema</p>
          </div>
        </div>

        {/* CONTENEDOR FORMULARIO */}
        <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <ArrowUpRight size={180} className="text-blue-500" />
          </div>

          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Detalles del Movimiento</h3>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* BUSQUEDA PROVEEDOR */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <UserPlus size={14} /> {t("supplierLabel")}
                </label>
                <div className="bg-black/20 rounded-2xl">
                  <SearchBarUniversal 
                    onAddToCart={(item) => {
                      const supplier = item as any;
                      setSelectedSupplier(supplier.id);
                    }} 
                    showResults={true}
                    placeholder={"Buscar proveedores..."}
                    searchType="suppliers"
                  />
                </div>
              </div>

              {/* CANTIDAD / MONTO */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <span className="text-blue-500 font-mono text-lg">$</span> {t("quantityLabel")}
                </label>
                <div className="relative group">
                  <Input
                    type="text"
                    value={quantityText}
                    onChange={handleQuantityChange}
                    placeholder="0"
                    className="w-full bg-white/5 border-white/10 text-2xl font-mono font-black py-6 px-6 rounded-2xl focus:border-blue-500 transition-all text-white placeholder:text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* BOTÓN ACCIÓN */}
            <button
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.4em] transition-all active:scale-95 disabled:bg-slate-800 disabled:text-slate-600 shadow-xl flex items-center justify-center gap-3"
              onClick={handleCreateDeposit}
              disabled={loading || !selectedSupplier || quantity <= 0}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Procesando...
                </>
              ) : (
                "Confirmar Registro de Ingreso"
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Sobreescritura estética para SearchBar e Inputs */
        input {
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border-radius: 1.25rem !important;
          height: auto !important;
          padding: 1.25rem !important;
          font-weight: 700 !important;
        }
        input:focus {
          border-color: #3b82f6 !important;
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .container { max-width: 100% !important; }
      `}</style>
    </div>
  );
}