"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, User, Building2, ShoppingBag } from "lucide-react";

import { Invoice } from "@/types/Api";

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

interface InvoiceDetailClientProps {
    invoice: Invoice;
}

export default function InvoiceDetailClient({ invoice }: InvoiceDetailClientProps) {
    const router = useRouter();
    const t = useTranslations("invoiceDetail");

    const infoCards = [
        { label: t("invoiceId"), value: invoice.id },
        { label: t("date"), value: new Date(invoice.date).toLocaleString("es-CO") },
        { label: t("electronic"), value: invoice.electronicBill ? t("yes") : t("no") },
        { label: "Total", value: formatCurrency(Number(invoice.totalPrice || 0)) },
    ];

    return (
        <div className="w-full max-w-3xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1
                        className="text-2xl font-bold text-white tracking-tight"
                        style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.02em" }}
                    >
                        {t("title")}<span style={{ color: "#4a7fff" }}>.</span>
                    </h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Detalle de factura
                    </p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                    <ArrowLeft size={14} /> {t("backButton")}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                {infoCards.map(({ label, value }) => (
                    <div
                        key={label}
                        className="p-4 rounded-2xl"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
                    >
                        <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
                        <p className="text-sm text-white font-medium break-all">{value}</p>
                    </div>
                ))}
            </div>

            <div
                className="rounded-2xl p-5 mb-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg" style={{ background: "rgba(74,127,255,0.1)" }}>
                        <User size={13} style={{ color: "#4a7fff" }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{t("clientSection")}</span>
                </div>
                <div className="space-y-1.5 text-sm">
                    <p style={{ color: "rgba(255,255,255,0.7)" }}><span style={{ color: "rgba(255,255,255,0.35)" }}>{t("client.name")} </span>{invoice.client.firstName} {invoice.client.lastName}</p>
                    <p style={{ color: "rgba(255,255,255,0.7)" }}><span style={{ color: "rgba(255,255,255,0.35)" }}>{t("client.id")}: </span>{invoice.client.identification}</p>
                    <p style={{ color: "rgba(255,255,255,0.7)" }}><span style={{ color: "rgba(255,255,255,0.35)" }}>{t("client.email")}: </span>{invoice.client.email}</p>
                </div>
            </div>

            <div
                className="rounded-2xl p-5 mb-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg" style={{ background: "rgba(74,127,255,0.1)" }}>
                        <Building2 size={13} style={{ color: "#4a7fff" }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{t("companySection")}</span>
                </div>
                <div className="space-y-1.5 text-sm">
                    <p style={{ color: "rgba(255,255,255,0.7)" }}><span style={{ color: "rgba(255,255,255,0.35)" }}>{t("company.name")}: </span>{invoice.tenant.name}</p>
                    <p style={{ color: "rgba(255,255,255,0.7)" }}><span style={{ color: "rgba(255,255,255,0.35)" }}>{t("company.nit")}: </span>{invoice.tenant.nit}</p>
                    <p style={{ color: "rgba(255,255,255,0.7)" }}><span style={{ color: "rgba(255,255,255,0.35)" }}>{t("company.address")}: </span>{invoice.tenant.address}</p>
                    <p style={{ color: "rgba(255,255,255,0.7)" }}><span style={{ color: "rgba(255,255,255,0.35)" }}>{t("company.phone")}: </span>{invoice.tenant.phone}</p>
                </div>
            </div>

            <div
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg" style={{ background: "rgba(74,127,255,0.1)" }}>
                        <ShoppingBag size={13} style={{ color: "#4a7fff" }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{t("productsSection")}</span>
                </div>
                {invoice.invoiceProducts.length === 0 ? (
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>{t("noProducts")}</p>
                ) : (
                    <div className="space-y-2">
                        {invoice.invoiceProducts.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between items-center py-2"
                                style={{ borderBottom: "1px solid rgba(30,60,139,0.2)" }}
                            >
                                <span className="text-sm text-white">{item.product?.name}</span>
                                <span className="text-xs font-bold" style={{ color: "rgba(74,127,255,0.8)" }}>
                                    x{item.quantity}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
