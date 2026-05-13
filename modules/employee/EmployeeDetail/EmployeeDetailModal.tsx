"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { X, Mail, Shield } from "lucide-react";

import { EmployeeDAO } from "@/types/Api";

interface EmployeeDetailModalProps {
  employee: EmployeeDAO | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmployeeDetailModal({ employee, isOpen, onClose }: EmployeeDetailModalProps) {
  const t = useTranslations("employeeDetails");

  if (!isOpen || !employee) return null;

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
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3"
              style={{ background: "rgba(74,127,255,0.2)", border: "1px solid rgba(74,127,255,0.3)" }}
            >
              {employee.name?.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "Syne, sans-serif" }}>{employee.name}</h3>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{t("id")}: {employee.id}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Mail size={12} style={{ color: "rgba(74,127,255,0.7)" }} />
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{t("email")}</span>
              </div>
              <p className="text-sm text-white font-medium">{employee.email || "—"}</p>
            </div>
            <div
              className="p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield size={12} style={{ color: "rgba(74,127,255,0.7)" }} />
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{t("role")}</span>
              </div>
              <p className="text-sm text-white font-medium">{employee.role || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
