'use client';

import { useTranslations } from 'next-intl';
import Input from '@/components/atoms/Input';
import SearchBarUniversal from '@/components/molecules/SearchBar';
import { ProductDAO } from '@/types/Api';

interface Props {
  quantity: string;
  price: string;
  name: string;
  setQuantity: (q: string) => void;
  setName: (name: string) => void;
  setPrice: (price: string) => void;
  setStock: (stock: number) => void;
  setTax: (tax: number) => void;
  setSelectedProductId: (id: string) => void;
  setTenantIdProduct: (id: string) => void;
  handleAddItem: () => void;
}

export default function SaleForm({
  quantity, price, name,
  setQuantity, setName, setPrice,
  setStock, setTax, setSelectedProductId,
  setTenantIdProduct, handleAddItem
}: Props) {
  const t = useTranslations("makeSale");

  return (
    <div className="flex-1 min-w-[300px] border border-gray-600 bg-transparent p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-white">{t('addItems')}</h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-white">{t('product')}</label>
          <SearchBarUniversal
            searchType="products"
            onAddToCart={(item) => {
              const product = item as ProductDAO;
              setName(product.name);
              setPrice('');
              setStock(product.stock);
              setTax(product.tax);
              setSelectedProductId(product.id);
              setTenantIdProduct(product.tenantId);
            }}
            showResults={true}
            placeholder={t('searchPlaceholder')}
          />
        </div>

        <div className="flex flex-row space-x-7">
          <div className="flex flex-col w-full">
            <label className="mb-1 text-sm font-medium text-white">Cantidad</label>
              <Input
                type="text"
                value={ quantity }
                disabled={!name}
                onChange={(e) => {
                  let raw = e.target.value.replace(/\./g, "");

                  if (!/^\d*$/.test(raw)) {
                    return; 
                  }

                  if (/^0[0-9]/.test(raw)) {
                    raw = raw.replace(/^0+/, "");
                  }

                  if (raw === "") {
                    setQuantity("");
                    return;
                  }

                  const numberValue = parseInt(raw, 10);
                  if (isNaN(numberValue)) {
                    setQuantity("");
                    return;
                  }
                  setQuantity(numberValue.toString());
                }}
                placeholder={t("quantityPlaceholder")}
              />
          </div>
          <div className="flex flex-col w-full">
            <label className="mb-1 text-sm font-medium text-white">{t("apricewTx")}</label>
              <Input
                type="text"
                value={
                  price === ""
                    ? ""
                    : parseInt(price, 10).toLocaleString("es-CO", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })
                }
                disabled={!name}
                onChange={(e) => {
                  let raw = e.target.value.replace(/\./g, "");

                  if (!/^\d*$/.test(raw)) {
                    return; 
                  }

                  if (/^0[0-9]/.test(raw)) {
                    raw = raw.replace(/^0+/, "");
                  }

                  if (raw === "") {
                    setPrice("");
                    return;
                  }

                  const numberValue = parseInt(raw, 10);
                  if (isNaN(numberValue)) {
                    setPrice("");
                    return;
                  }
                  setPrice(numberValue.toString());
                }}
                placeholder={t("pricePlaceholder")}
              />

          </div>
        </div>

        <button
          onClick={handleAddItem}
          disabled={!name || !quantity || parseFloat(quantity) <= 0}
          className="px-6 py-2 bg-homePrimary text-white rounded-md hover:bg-homePrimary-400 disabled:bg-gray-500 transition-colors w-full"
        >
          {t('addProduct')}
        </button>
      </div>
    </div>
  );
}
