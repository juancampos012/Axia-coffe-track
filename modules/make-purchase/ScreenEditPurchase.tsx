"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";

import Input from "@/components/atoms/Input";
import { Compra, SaleItemForAPI, ProductDAO } from "@/types/Api";
import { useShoppingCart } from "@/store/EditPurchaseCart";
import CustomButton from "@/components/atoms/CustomButton";
import { actualizarCompra, getPurchaseById } from "@/lib/api-purchase";
import SearchBarUniversal from "@/components/molecules/SearchBar";

interface Props {
  invoiceId: string;
}

export default function ScreenEditPurchase({ invoiceId }: Props) {
  const { user } = useAuth();
  const t = useTranslations("purchase");

  const [purchaseDate, setPurchaseDate] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDAO | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantityInCart,
    setCart,
    clearCart,
  } = useShoppingCart();

  const total = cart.reduce((acc, item) => acc + item.purchasePrice * item.quantity, 0);
  const isSupplierDisabled = cart.length > 0;

  useEffect(() => {
    const fetchCompra = async () => {
      try {
        const compra: Compra = await getPurchaseById(invoiceId);
        setPurchaseDate(compra.date || "");
        const supplier = compra.products[0]?.product?.supplier;
        setSupplierName(supplier?.name || "Proveedor no disponible");
        setSelectedSupplier(supplier?.id || null);

        const productosConvertidos = compra.products.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
          tax: item.product?.tax || 0,
          name: item.product?.name || "Producto sin nombre",
          supplier: item.product?.supplier,
          salePrice: item.product?.salePrice || 0,
          purchasePrice: item.product?.purchasePrice || 0,
          tenantId: compra.tenantId,
          stock: item.product?.stock || 0,
        }));
        setCart(productosConvertidos);
      } catch (error) {
        console.error("Error al cargar la compra:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompra();
  }, [invoiceId]);

  const formatCurrency = (value: number) =>
    value.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });

  const handleUpdatePurchase = async () => {
    const productosParaAPI: SaleItemForAPI[] = cart.map((item) => ({
      tenantId: user?.tenantId || "",
      productId: item.id.toString(),
      quantity: item.quantity,
    }));

    const compraActualizada: Compra = {
      tenantId: user?.tenantId || "",
      supplierId: cart[0]?.supplier?.id,
      totalPrice: total,
      electronicBill: false,
      date: purchaseDate,
      products: productosParaAPI,
    };

    try {
      await actualizarCompra(invoiceId, compraActualizada);
      alert("¡Compra actualizada con éxito!");
    } catch (error) {
      console.error("Error al actualizar la compra:", error);
      alert("Hubo un error al actualizar la compra.");
    }
  };

  const handleAddToCart = (product: ProductDAO) => {
    addToCart({
      id: product.id,
      quantity: quantity,
      tax: product.tax,
      name: product.name,
      supplier: product.supplier,
      salePrice: product.salePrice,
      purchasePrice: product.purchasePrice,
      tenantId: user?.tenantId || "",
      stock: product.stock,
    });
  };

  if (loading) {
    return <div className="text-white text-center mt-10">{t("loading")}</div>;
  }

  return (
    <div className="relative w-full min-h-screen text-white flex justify-center">
      <Image
        src="/Images/fondoHerooo.png"
        alt="Background Image"
        fill
        className="absolute top-0 left-0 w-full h-full object-cover"
        priority
      />

      <div className="relative w-full my-6 bg-black bg-opacity-50 rounded-lg shadow-lg mt-5 p-6">
        <h2 className="text-2xl font-semibold mb-4">{t("editPurchaseTitle")}</h2>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">{t("supplier")}</label>
            <Input
              type="text"
              value={supplierName}
              disable={true}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">{t("purchaseDate")}</label>
            <Input
              type="date"
              value={purchaseDate.slice(0, 10)}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">{t("productLabel")}</label>
            <SearchBarUniversal
              resetTrigger={searchResetKey}
              onAddToCart={(item) => {
                const product = item as ProductDAO;
                setSelectedProduct(product);
              }}
              showResults={true}
              placeholder={t("productPlaceholder")}
              searchType="products"
              supplierIdFilter={selectedSupplier}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">{t("quantityLabel")}</label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              placeholder={t("quantityPlaceholder")}
            />
          </div>
        </div>

        <button
          className="px-6 py-2 bg-homePrimary border text-white rounded-md hover:bg-homePrimary-400 disabled:bg-gray-500 transition-colors w-full mb-6"
          onClick={() => {
            if (!selectedProduct) return;
            handleAddToCart(selectedProduct);
            setSelectedProduct(null);
            setQuantity(1);
            setSearchResetKey(prev => prev + 1);
          }}
          disabled={!selectedProduct}
        >
          {t("addProductButton")}
        </button>

        {cart.length === 0 ? (
          <p className="text-gray-400">{t("emptyCart")}</p>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-700 mb-4">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2">{t("product")}</th>
                  <th className="px-4 py-2">{t("quantity")}</th>
                  <th className="px-4 py-2">{t("basePrice")}</th>
                  <th className="px-4 py-2">{t("subtotal")}</th>
                  <th className="px-4 py-2">{t("action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantityInCart(item.id, parseInt(e.target.value) || 0)
                        }
                      />
                    </td>
                    <td className="px-4 py-2">{formatCurrency(item.purchasePrice)}</td>
                    <td className="px-4 py-2">
                      {formatCurrency(item.purchasePrice * item.quantity)}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-600 px-3 py-1 rounded hover:bg-red-900/30 transition-colors"
                      >
                        {t("delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">
                {t("total")}: {formatCurrency(total)}
              </span>
              <CustomButton
                text={t("clearCart")}
                onClickButton={clearCart}
                style="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                typeButton="button"
              />
            </div>
          </>
        )}

        <div className="mt-6">
          <CustomButton
            text={t("saveChanges")}
            onClickButton={handleUpdatePurchase}
            style="px-6 py-2 bg-homePrimary border text-white rounded-md hover:bg-homePrimary-400 disabled:bg-gray-500 transition-colors w-full"
            typeButton="button"
            disabled={cart.length === 0}
          />
        </div>
      </div>
    </div>
  );
}
