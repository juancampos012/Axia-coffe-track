"use client"

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Package, TrendingUp } from "lucide-react";

import { ProductDAO } from "@/types/Api";

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

interface ProductDetailClientProps {
    product: ProductDAO;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
    const router = useRouter();
    const t = useTranslations("productDetail");

    const margin = product.purchasePrice > 0
        ? ((product.salePrice - product.purchasePrice) / product.purchasePrice * 100).toFixed(2)
        : "0.00";

    const fields = [
        { label: t("supplier"), value: product.supplier?.name || "—" },
        { label: t("tax"), value: `${product.tax}%` },
        { label: t("stock"), value: `${product.stock} ${t("units")}` },
        { label: t("purchasePrice"), value: formatCurrency(product.purchasePrice) },
        { label: t("salePrice"), value: formatCurrency(product.salePrice) },
        { label: "Margen", value: `${margin}%` },
    ];

    return (
        <div className="w-full max-w-2xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1
                        className="text-2xl font-bold text-white tracking-tight"
                        style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.02em" }}
                    >
                        {t("title")}<span style={{ color: "#4a7fff" }}>.</span>
                    </h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Ficha del producto
                    </p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                    <ArrowLeft size={14} /> {t("back")}
                </button>
            </div>

            <div
                className="rounded-2xl p-px mb-6"
                style={{ background: "linear-gradient(135deg, rgba(30,60,139,0.5) 0%, rgba(74,127,255,0.15) 100%)" }}
            >
                <div
                    className="rounded-[15px] p-8 text-center"
                    style={{ background: "rgba(4,6,18,0.96)", backdropFilter: "blur(20px)" }}
                >
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: "rgba(74,127,255,0.1)", border: "1px solid rgba(74,127,255,0.2)" }}
                    >
                        <Package size={24} style={{ color: "#4a7fff" }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
                        {product.name}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {t("id")}: {product.id}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(({ label, value }) => (
                    <div
                        key={label}
                        className="p-5 rounded-2xl"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
                    >
                        <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
                        <p className="text-sm text-white font-medium">{value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
