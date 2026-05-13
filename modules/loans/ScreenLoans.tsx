"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBalance } from "@/context/BalanceContext";
import { createSimpleLoan } from "@/request/loans";
import { ClientDAO } from "@/types/Api";
import SearchBarUniversal from "@/components/molecules/SearchBar";
import LoanReceiptGenerator from "./LoanReceiptGenerator";
import {
  User,
  DollarSign,
  FileText,
  CheckCircle2,
  Receipt,
  Printer,
  RefreshCw,
  Loader2,
} from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ScreenSimpleLoans() {
  const { user } = useAuth();
  const { balance, setBalance } = useBalance();
  const [selectedClient, setSelectedClient] = useState<ClientDAO | null>(null);
  const [amountText, setAmountText] = useState("");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loanCompleted, setLoanCompleted] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\./g, "");
    if (!/^\d*$/.test(raw)) return;
    if (/^0[0-9]/.test(raw)) raw = raw.replace(/^0+/, "");
    if (raw === "") { setAmountText(""); setAmount(0); return; }
    const n = parseInt(raw, 10);
    if (!isNaN(n)) { setAmountText(n.toLocaleString("es-CO")); setAmount(n); }
  };

  const generateLoanReceiptPDF = async () => {
    if (!selectedClient || !amount) return null;
    const pdfBlob = await LoanReceiptGenerator.generatePDF({ client: selectedClient, amount, description });
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
    return url;
  };

  const handleCreateSimpleLoan = async () => {
    if (!selectedClient || !amount || amount <= 0 || !user) return;
    try {
      setLoading(true);
      await createSimpleLoan({
        clientId: selectedClient.id,
        clientName: `${selectedClient.firstName} ${selectedClient.lastName}`,
        clientIdentification: selectedClient.identification,
        amount,
        description: description.trim(),
        status: false,
        tenantId: user.tenantId,
      });
      if (balance !== null) setBalance(balance - amount);
      await generateLoanReceiptPDF();
      setLoanCompleted(true);
    } catch (error: any) {
      alert(error.message || "Error al entregar el dinero.");
    } finally {
      setLoading(false);
    }
  };

  const resetLoanForm = () => {
    setSelectedClient(null);
    setAmountText("");
    setAmount(0);
    setDescription("");
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setLoanCompleted(false);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-white tracking-tight"
          style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.02em" }}
        >
          Entregar Dinero<span style={{ color: "#4a7fff" }}>.</span>
        </h1>
        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Registro de préstamos y adelantos
        </p>
      </div>

      {!loanCompleted ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-8 space-y-5">

            {/* Cliente */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl" style={{ background: "rgba(74,127,255,0.1)" }}>
                  <User size={15} style={{ color: "#4a7fff" }} />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Persona
                </span>
              </div>
              <SearchBarUniversal
                onAddToCart={(item) => setSelectedClient(item as ClientDAO)}
                showResults={true}
                placeholder="Buscar por nombre o identificación..."
                searchType="clients"
              />
              {selectedClient && (
                <div
                  className="mt-4 flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(74,127,255,0.08)", border: "1px solid rgba(74,127,255,0.2)" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "rgba(74,127,255,0.3)" }}
                  >
                    {selectedClient.firstName.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-white">
                    {selectedClient.firstName} {selectedClient.lastName}
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-widest ml-auto"
                    style={{ color: "rgba(74,127,255,0.7)" }}
                  >
                    {selectedClient.identification}
                  </span>
                </div>
              )}
            </div>

            {/* Monto */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl" style={{ background: "rgba(74,127,255,0.1)" }}>
                  <DollarSign size={15} style={{ color: "#4a7fff" }} />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Monto del Préstamo (COP)
                </span>
              </div>
              <input
                type="text"
                value={amountText}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-transparent outline-none text-4xl font-mono font-bold text-white placeholder:text-white/10"
                style={{ borderBottom: "1px solid rgba(30,60,139,0.4)" }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "rgba(74,127,255,0.7)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(30,60,139,0.4)")}
              />
            </div>

            {/* Descripción */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl" style={{ background: "rgba(74,127,255,0.1)" }}>
                  <FileText size={15} style={{ color: "#4a7fff" }} />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Notas (opcional)
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Motivo del préstamo..."
                rows={3}
                className="w-full bg-transparent outline-none text-sm text-white resize-none placeholder:text-white/15"
                style={{ borderBottom: "1px solid rgba(30,60,139,0.3)" }}
              />
            </div>
          </div>

          {/* Panel de resumen */}
          <div className="lg:col-span-4">
            <div
              className="sticky top-6 rounded-2xl p-px"
              style={{
                background: "linear-gradient(135deg, rgba(30,60,139,0.5) 0%, rgba(74,127,255,0.15) 100%)",
              }}
            >
              <div
                className="rounded-[15px] p-6"
                style={{ background: "rgba(4,6,18,0.96)", backdropFilter: "blur(20px)" }}
              >
                <h3
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 pb-4"
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  Resumen de Operación
                </h3>

                <div className="space-y-5 mb-8">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                      Beneficiario
                    </span>
                    <span className="text-sm font-bold text-white">
                      {selectedClient
                        ? `${selectedClient.firstName} ${selectedClient.lastName}`
                        : <span style={{ color: "rgba(255,255,255,0.2)" }} className="italic text-xs">Sin seleccionar</span>}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                      Total a Entregar
                    </span>
                    <span
                      className="text-3xl font-mono font-bold"
                      style={{ color: amount > 0 ? "#4a7fff" : "rgba(255,255,255,0.15)" }}
                    >
                      {amount > 0 ? formatCurrency(amount) : "$0"}
                    </span>
                  </div>

                  {balance !== null && (
                    <div
                      className="p-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                        Saldo Restante
                      </span>
                      <span className="text-sm font-mono font-bold" style={{ color: "rgba(74,127,255,0.8)" }}>
                        {formatCurrency(balance - amount)}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCreateSimpleLoan}
                  disabled={loading || !selectedClient || amount <= 0}
                  className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)", boxShadow: "0 4px 14px rgba(30,60,139,0.4)" }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Procesando...
                    </>
                  ) : (
                    "Entregar Dinero"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Estado de éxito */
        <div className="flex items-center justify-center py-12">
          <div
            className="w-full max-w-md rounded-2xl p-px"
            style={{ background: "linear-gradient(135deg, rgba(30,60,139,0.5) 0%, rgba(74,127,255,0.2) 100%)" }}
          >
            <div
              className="rounded-[15px] p-10 text-center"
              style={{ background: "rgba(4,6,18,0.96)", backdropFilter: "blur(24px)" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
              >
                <CheckCircle2 size={32} style={{ color: "#10b981" }} />
              </div>

              <h3
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Préstamo Registrado
              </h3>
              <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                {selectedClient?.firstName} {selectedClient?.lastName}
              </p>
              <p
                className="text-3xl font-mono font-bold mb-8"
                style={{ color: "#10b981" }}
              >
                {formatCurrency(amount)}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => pdfUrl && window.open(pdfUrl, "_blank")}
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
                >
                  <Receipt size={14} /> Ver Recibo
                </button>
                <button
                  onClick={() => { const w = window.open(pdfUrl!, "_blank"); w?.print(); }}
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:opacity-90 text-white"
                  style={{ background: "linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)" }}
                >
                  <Printer size={14} /> Imprimir
                </button>
                <button
                  onClick={resetLoanForm}
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-white/5"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  <RefreshCw size={14} /> Nuevo Préstamo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
