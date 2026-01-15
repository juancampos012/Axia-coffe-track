'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useBalance } from '@/context/BalanceContext';

import { ClientDAO, SaleItem } from '@/types/Api';
import { createPayment } from '@/lib/api-sales';
import { crearFacturaVenta } from '@/lib/api-saleInvoce';
import SearchBarUniversal from '@/components/molecules/SearchBar';
import InvoicePDFGenerator from "./InvoicePDFGenerator";
import { ProductDAO } from '@/types/Api';

export default function ScreenMakeSale() {
  const t = useTranslations("makeSale");
  const { user } = useAuth();
  const { balance, setBalance } = useBalance();

  const [selectedProductId, setSelectedProductId] = useState('');
  const [tenantIdProduct, setTenantIdProduct] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [quantity, setQuantity] = useState('');
  const [nextId, setNextId] = useState(1);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(0);
  const [name, setName] = useState('');
  const [tax, setTax] = useState(0);
  const [selectedClient, setSelectedClient] = useState<ClientDAO | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [saleCompleted, setSaleCompleted] = useState(false);

  const resetSaleForm = () => {
    setItems([]);
    setName('');
    setQuantity('');
    setPrice('');
    setStock(0);
    setTax(0);
    setSelectedProductId('');
    setSelectedClient(null);
    setNextId(1);
    setPdfUrl(null);
    setSaleCompleted(false);
  };

  const handleAddItem = () => {
    const priceValue = parseFloat(price);
    if (!name || isNaN(priceValue) || priceValue <= 0 || Number(quantity) <= 0) return;
    
    const basePriceValue = priceValue;
    const priceWithTax = priceValue * (1 + tax / 100);

    const newItem: SaleItem = {
      id: nextId,
      tenantId: tenantIdProduct,
      productId: selectedProductId,
      name,
      quantity: parseInt(quantity, 10),
      stock,
      price: priceWithTax,
      basePrice: basePriceValue,
      tax,
    };
    
    setItems([...items, newItem]);
    setNextId(nextId + 1);
    
    // Reset solo campos de producto
    setQuantity('');
    setPrice('');
    setStock(0);
    setTax(0);
    setName('');
    setSelectedProductId('');
    
    // Auto-focus en búsqueda de producto
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder*="producto"]');
      if (searchInput) (searchInput as HTMLInputElement).focus();
    }, 100);
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + item.quantity * item.basePrice, 0);
  };

  const calculateTaxTotal = () => {
    return items.reduce((total, item) => {
      const taxAmount = (item.price - item.basePrice) * item.quantity;
      return total + taxAmount;
    }, 0);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  };

  const handleCompleteSale = async () => {
    if (items.length === 0) {
      alert(t("addBeforeComplete"));
      return;
    }

    if (!selectedClient) {
      alert("Por favor, selecciona un cliente antes de completar la venta");
      return;
    }

    if (!user) {
      alert("No hay usuario autenticado");
      return;
    }

    setIsProcessing(true);

    try {
      const productsForAPI = items.map(item => ({
        tenantId: user.tenantId,
        productId: item.productId || '',
        quantity: item.quantity,
        unitPrice: item.price
      }));

      const invoiceResponse = await crearFacturaVenta({
        clientId: selectedClient.id,
        totalPrice: calculateTotal(),
        tenantId: user.tenantId,
        electronicBill: false,
        products: productsForAPI
      });

      await createPayment({
        tenantId: user.tenantId,
        amount: calculateTotal(),
        paymentMethod: 'CASH',
        reference: `PAY-${Date.now()}`,
        invoiceId: invoiceResponse.id
      });

      if (balance !== null) {
        setBalance(balance - calculateTotal());
      }

      const pdfBlob = await InvoicePDFGenerator.generatePDF({
        items,
        subtotal: calculateSubtotal(),
        taxTotal: calculateTaxTotal(),
        total: calculateTotal(),
        client: selectedClient,
        user,
        t
      });

      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setSaleCompleted(true);

    } catch (error) {
      console.error('Error procesando la venta:', error);
      alert("Hubo un error al procesar la venta. Por favor, intenta nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name && quantity && price && parseFloat(quantity) > 0 && parseFloat(price) > 0) {
      handleAddItem();
    }
  };

  return (
    <div className="w-full min-h-screen p-4 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">{t('title')}</h2>
        </div>

        {!saleCompleted ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Izquierda: Entrada de Productos */}
            <div className="lg:col-span-2 space-y-4">
              {/* Cliente */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">👤 Cliente</label>
                <SearchBarUniversal
                  searchType="clients"
                  onAddToCart={(item) => setSelectedClient(item as ClientDAO)}
                  showResults={true}
                  placeholder="Buscar cliente..."
                />
              </div>

              {/* Agregar Producto - Diseño Horizontal */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <label className="block text-sm font-medium mb-3">🛍️ Agregar Producto</label>
                
                <div className="space-y-3">
                  {/* Búsqueda de producto */}
                  <SearchBarUniversal
                    searchType="products"
                    onAddToCart={(item) => {
                      const product = item as ProductDAO;
                      setName(product.name);
                      setPrice(product.salePrice?.toString() || '');
                      setStock(product.stock);
                      setTax(product.tax);
                      setSelectedProductId(product.id);
                      setTenantIdProduct(product.tenantId);
                      setTimeout(() => {
                        const qtyInput = document.querySelector('input[name="quantity"]');
                        if (qtyInput) (qtyInput as HTMLInputElement).focus();
                      }, 100);
                    }}
                    showResults={true}
                    placeholder="Buscar producto..."
                  />

                  {/* Cantidad y Precio en línea */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1 text-gray-400">Cantidad</label>
                      <input
                        name="quantity"
                        type="text"
                        value={quantity}
                        disabled={!name}
                        onChange={(e) => {
                          let raw = e.target.value.replace(/\./g, "");
                          if (!/^\d*$/.test(raw)) return;
                          if (/^0[0-9]/.test(raw)) raw = raw.replace(/^0+/, "");
                          if (raw === "") {
                            setQuantity("");
                            return;
                          }
                          const numberValue = parseInt(raw, 10);
                          if (!isNaN(numberValue)) {
                            setQuantity(numberValue.toString());
                          }
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white text-lg font-semibold focus:outline-none focus:border-blue-500 disabled:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1 text-gray-400">Precio</label>
                      <input
                        name="price"
                        type="text"
                        value={price === "" ? "" : parseInt(price, 10).toLocaleString("es-CO")}
                        disabled={!name}
                        onChange={(e) => {
                          let raw = e.target.value.replace(/\./g, "");
                          if (!/^\d*$/.test(raw)) return;
                          if (/^0[0-9]/.test(raw)) raw = raw.replace(/^0+/, "");
                          if (raw === "") {
                            setPrice("");
                            return;
                          }
                          const numberValue = parseInt(raw, 10);
                          if (!isNaN(numberValue)) {
                            setPrice(numberValue.toString());
                          }
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="$0"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white text-lg font-semibold focus:outline-none focus:border-blue-500 disabled:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={handleAddItem}
                        disabled={!name || !quantity || !price || parseFloat(quantity) <= 0 || parseFloat(price) <= 0}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Productos */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 min-h-[400px]">
                <h3 className="text-lg font-semibold mb-3">🛒 Productos ({items.length})</h3>
                {items.length > 0 ? (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={item.id} className="bg-gray-900/50 border border-gray-600 rounded-lg p-3 flex justify-between items-center hover:border-gray-500 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-400">
                            {item.quantity} x {formatCurrency(item.price)} 
                            {item.tax > 0 && <span className="text-xs ml-2">(IVA {item.tax}%)</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-lg">{formatCurrency(item.quantity * item.price)}</p>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3 py-1 rounded transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-gray-500 italic">No hay productos agregados</p>
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha: Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 sticky top-4">
                <h3 className="text-xl font-bold mb-6">💰 Resumen</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>IVA:</span>
                    <span className="font-medium">{formatCurrency(calculateTaxTotal())}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Total:</span>
                      <span className="text-green-400">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>

                {!selectedClient && items.length > 0 && (
                  <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mb-4">
                    <p className="text-yellow-300 text-sm">⚠️ Selecciona un cliente</p>
                  </div>
                )}

                <button
                  onClick={handleCompleteSale}
                  disabled={items.length === 0 || !selectedClient || isProcessing}
                  className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-lg font-bold"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      Procesando...
                    </span>
                  ) : (
                    '✓ Completar Venta'
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center max-w-2xl mx-auto">
            <div className="text-7xl mb-6">🎉</div>
            <h3 className="text-3xl font-bold mb-4">¡Venta Completada!</h3>
            <p className="text-gray-300 mb-8">La factura se ha generado</p>
            
            <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-6 mb-8">
              <p className="text-lg mb-2">Cliente: <span className="font-bold">{selectedClient?.firstName} {selectedClient?.lastName}</span></p>
              <p className="text-3xl font-bold text-green-400">{formatCurrency(calculateTotal())}</p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => pdfUrl && window.open(pdfUrl, '_blank')}
                className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                📄 Ver Factura
              </button>
              <button
                onClick={resetSaleForm}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                + Nueva Venta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}