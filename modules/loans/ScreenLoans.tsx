"use client";

import React, { useState } from "react";
import { useAuth } from '@/context/AuthContext';
import { useBalance } from '@/context/BalanceContext'; // Importar useBalance
import { createSimpleLoan } from "@/request/loans";
import { ClientDAO } from "@/types/Api";
import SearchBarUniversal from "@/components/molecules/SearchBar";
import LoanReceiptGenerator from "./LoanReceiptGenerator";

// Función para formatear moneda
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ScreenSimpleLoans() {
  const { user } = useAuth();
  const { balance, setBalance } = useBalance(); // Obtener balance del contexto
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
    if (raw === "") {
      setAmountText("");
      setAmount(0);
      return;
    }
    const numberValue = parseInt(raw, 10);
    if (!isNaN(numberValue)) {
      setAmountText(numberValue.toLocaleString("es-CO"));
      setAmount(numberValue);
    }
  };

  const generateLoanReceiptPDF = async () => {
    if (!selectedClient || !amount) return null;

    try {
      const pdfBlob = await LoanReceiptGenerator.generatePDF({
        client: selectedClient,
        amount: amount,
        description: description
      });

      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      return url;
    } catch (error) {
      console.error("Error generando PDF:", error);
      throw error;
    }
  };

  const handleCreateSimpleLoan = async () => {
    if (!selectedClient) {
      alert("Por favor, selecciona una persona.");
      return;
    }

    if (!amount || amount <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    if (!user) {
      alert("No hay usuario autenticado");
      return;
    }

    try {
      setLoading(true);

      const loanData = {
        clientId: selectedClient.id,
        clientName: `${selectedClient.firstName} ${selectedClient.lastName}`,
        clientIdentification: selectedClient.identification,
        amount: amount,
        description: description.trim(),
        status: false, // Préstamo pendiente por defecto
        tenantId: user.tenantId
      };

      // Crear el préstamo
      const createdLoan = await createSimpleLoan(loanData);
      
      console.log("Préstamo creado:", createdLoan);
      
      // ACTUALIZAR BALANCE - Cuando se crea un préstamo pendiente, el dinero sale de la caja
      if (balance !== null) {
        setBalance(balance - amount);
      }
      
      // Generar el recibo PDF
      await generateLoanReceiptPDF();
      
      setLoanCompleted(true);
      
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al entregar el dinero.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const handlePrintReceipt = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      printWindow?.print();
    }
  };

  const resetLoanForm = () => {
    setSelectedClient(null);
    setAmountText("");
    setAmount(0);
    setDescription("");
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setLoanCompleted(false);
  };

  return (
    <div className="w-full min-h-screen p-4 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Entregar Dinero</h2>
        </div>

        {!loanCompleted ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Izquierda: Formulario */}
            <div className="lg:col-span-2 space-y-4">
              {/* Cliente */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">👤 Persona</label>
                <SearchBarUniversal 
                  onAddToCart={(item) => {
                    const client = item as ClientDAO;
                    setSelectedClient(client);
                  }}
                  showResults={true}
                  placeholder="Buscar persona por nombre o identificación"
                  searchType="clients"
                />
              </div>

              {/* Monto */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">💰 Monto del Préstamo</label>
                <div className="space-y-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={amountText}
                      onChange={handleAmountChange}
                      placeholder="Ej: 50.000"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white text-lg font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 sticky top-4">
                <h3 className="text-xl font-bold mb-6">📋 Resumen</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-900/30 border border-gray-600 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Persona</p>
                    {selectedClient ? (
                      <p className="font-medium">
                        {selectedClient.firstName} {selectedClient.lastName}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic text-sm">No seleccionada</p>
                    )}
                  </div>
                  
                  <div className="bg-gray-900/30 border border-gray-600 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Monto</p>
                    <p className={`text-2xl font-bold ${amount > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                      {amount > 0 ? formatCurrency(amount) : '$0'}
                    </p>
                  </div>
                </div>

                {/* Validaciones */}
                {!selectedClient && amount > 0 && (
                  <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mb-4">
                    <p className="text-yellow-300 text-sm">⚠️ Selecciona una persona</p>
                  </div>
                )}

                {balance !== null && amount > balance && (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4">
                    <p className="text-red-300 text-sm">⚠️ Fondos insuficientes</p>
                    <p className="text-red-400 text-xs mt-1">
                      Necesitas {formatCurrency(amount - balance)} más
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCreateSimpleLoan}
                  disabled={
                    loading || 
                    !selectedClient || 
                    amount <= 0 || 
                    (balance !== null && amount > balance)
                  }
                  className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-lg font-bold"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      Procesando...
                    </span>
                  ) : (
                    '✓ Entregar Dinero'
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center max-w-2xl mx-auto">
            <div className="text-7xl mb-6">✅</div>
            <h3 className="text-3xl font-bold mb-4">¡Préstamo Registrado!</h3>
            <p className="text-gray-300 mb-8">El dinero ha sido entregado y el recibo generado</p>
            
            <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-6 mb-8">
              <p className="text-lg mb-2">Persona: <span className="font-bold">{selectedClient?.firstName} {selectedClient?.lastName}</span></p>
              <p className="text-3xl font-bold text-green-400">{formatCurrency(amount)}</p>
              {description && (
                <p className="text-gray-400 mt-2 text-sm">{description}</p>
              )}
              {balance !== null && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <p className="text-sm text-gray-400">Nuevo balance:</p>
                  <p className="text-xl font-bold text-blue-300">
                    {formatCurrency(balance)}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleViewReceipt}
                className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                📄 Ver Recibo
              </button>
              <button
                onClick={handlePrintReceipt}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🖨️ Imprimir
              </button>
              <button
                onClick={resetLoanForm}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                + Nuevo Préstamo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}