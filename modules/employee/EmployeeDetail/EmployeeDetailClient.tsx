"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Shield } from "lucide-react";

import { EmployeeDAO } from "@/types/Api";

interface EmployeeDetailClientProps {
    employee: EmployeeDAO;
}

export default function EmployeeDetailClient({ employee }: EmployeeDetailClientProps) {
    const router = useRouter();
    const t = useTranslations("EmployeeDetailClient");

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
                        Perfil del empleado
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

            <div
                className="rounded-2xl p-px mb-6"
                style={{ background: "linear-gradient(135deg, rgba(30,60,139,0.5) 0%, rgba(74,127,255,0.15) 100%)" }}
            >
                <div
                    className="rounded-[15px] p-8 text-center"
                    style={{ background: "rgba(4,6,18,0.96)", backdropFilter: "blur(20px)" }}
                >
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4"
                        style={{ background: "rgba(74,127,255,0.2)", border: "1px solid rgba(74,127,255,0.3)" }}
                    >
                        {employee.name?.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
                        {employee.name}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {t("id")}: {employee.id}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    className="p-5 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Mail size={14} style={{ color: "rgba(74,127,255,0.7)" }} />
                        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{t("email")}</span>
                    </div>
                    <p className="text-sm text-white font-medium">{employee.email || "—"}</p>
                </div>

                <div
                    className="p-5 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(30,60,139,0.25)" }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Shield size={14} style={{ color: "rgba(74,127,255,0.7)" }} />
                        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{t("role")}</span>
                    </div>
                    <p className="text-sm text-white font-medium">{employee.role || "—"}</p>
                </div>
            </div>
        </div>
    );
}
