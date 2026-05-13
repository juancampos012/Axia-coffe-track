"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { X, Phone, MapPin } from "lucide-react";

import { SupplierDAO } from "@/types/Api";

interface SupplierDetailProps {
  supplier: SupplierDAO | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SupplierDetail({ supplier, isOpen, onClose }: SupplierDetailProps) {
  const t = useTranslations("supplierDetail");

  if (!isOpen || !supplier) return null;

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
            <div>
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {t("title")}<span style={{ color: "#4a7fff" }}>.</span>
              </h2>
              <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                ID: {supplier.id}
              </p>
            </div>
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
            <h3
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {supplier.name}
            </h3>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(74,127,255,0.7)" }}>
              NIT: {supplier.nit}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Phone size={13} style={{ color: "rgba(74,127,255,0.7)" }} />
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{t("phone")}</span>
              </div>
              <p className="text-sm text-white font-medium">{supplier.phone || "—"}</p>
            </div>

            <div
              className="p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={13} style={{ color: "rgba(74,127,255,0.7)" }} />
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{t("address")}</span>
              </div>
              <p className="text-sm text-white font-medium">{supplier.address || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
