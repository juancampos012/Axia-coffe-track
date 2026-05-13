"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { X, Package } from "lucide-react";

import { ProductDAO } from "@/types/Api";

interface ProductDetailModalProps {
  product: ProductDAO | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const t = useTranslations("productDetail");

  if (!isOpen || !product) return null;

  const fields = [
    { label: t("tax"), value: `${product.tax}%` },
    { label: t("stock"), value: `${product.stock} ${t("units")}` },
    { label: t("purchasePrice"), value: `$${product.purchasePrice}` },
    { label: t("salePrice"), value: `$${product.salePrice}` },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(4,6,18,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-px"
        style={{ background: "linear-gradient(135deg, rgba(30,60,139,0.5) 0%, rgba(74,127,255,0.2) 100%)" }}
      >
        <div
          className="rounded-[15px] p-8"
          style={{ background: "rgba(4,6,18,0.96)", backdropFilter: "blur(24px)" }}
        >
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Syne, sans-serif" }}>
              {t("title")}<span style={{ color: "#4a7fff" }}>.</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <X size={16} />
            </button>
          </div>

          <div
            className="text-center py-6 mb-6 rounded-xl"
            style={{ background: "rgba(74,127,255,0.05)", border: "1px solid rgba(74,127,255,0.15)" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(74,127,255,0.1)" }}>
              <Package size={20} style={{ color: "#4a7fff" }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "Syne, sans-serif" }}>{product.name}</h3>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{t("id")}: {product.id}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ label, value }) => (
              <div
                key={label}
                className="p-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
              >
                <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
                <p className="text-sm text-white font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
