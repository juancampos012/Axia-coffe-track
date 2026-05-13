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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name && quantity && parseFloat(quantity) > 0) {
      handleAddItem();
    }
  };

  return (
    <div
      className="flex-1 min-w-[300px] p-6 rounded-2xl"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
    >
      <h2
        className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        {t('addItems')}
      </h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label
            className="text-[10px] font-bold uppercase tracking-widest block mb-1"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {t('product')}
          </label>
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
            placeholder={t('searchPlaceholder')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="text-[10px] font-bold uppercase tracking-widest block mb-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Cantidad
            </label>
            <Input
              name="quantity"
              type="text"
              value={quantity}
              disabled={!name}
              onChange={(e) => {
                let raw = e.target.value.replace(/\./g, "");
                if (!/^\d*$/.test(raw)) return;
                if (/^0[0-9]/.test(raw)) raw = raw.replace(/^0+/, "");
                if (raw === "") { setQuantity(""); return; }
                const numberValue = parseInt(raw, 10);
                if (!isNaN(numberValue)) setQuantity(numberValue.toString());
              }}
              onKeyPress={handleKeyPress}
              placeholder="0"
              autoFocus={!!name}
            />
          </div>
          <div>
            <label
              className="text-[10px] font-bold uppercase tracking-widest block mb-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Precio
            </label>
            <Input
              name="price"
              type="text"
              value={price === "" ? "" : parseInt(price, 10).toLocaleString("es-CO")}
              disabled={!name}
              onChange={(e) => {
                let raw = e.target.value.replace(/\./g, "");
                if (!/^\d*$/.test(raw)) return;
                if (/^0[0-9]/.test(raw)) raw = raw.replace(/^0+/, "");
                if (raw === "") { setPrice(""); return; }
                const numberValue = parseInt(raw, 10);
                if (!isNaN(numberValue)) setPrice(numberValue.toString());
              }}
              onKeyPress={handleKeyPress}
              placeholder="$0"
            />
          </div>
        </div>

        {name && (
          <div
            className="mt-1 p-3 rounded-xl text-sm font-medium text-white"
            style={{ background: "rgba(74,127,255,0.08)", border: "1px solid rgba(74,127,255,0.2)" }}
          >
            {name}
          </div>
        )}

        <button
          onClick={handleAddItem}
          disabled={!name || !quantity || parseFloat(quantity) <= 0}
          className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)", boxShadow: "0 4px 14px rgba(30,60,139,0.4)" }}
        >
          {t('addProduct')}
        </button>
      </div>
    </div>
  );
}
