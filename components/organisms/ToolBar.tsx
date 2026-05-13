import React from "react";
import { useTranslations } from "next-intl";
import { CirclePlus, Printer } from "lucide-react";
import CustomButton from "../atoms/CustomButton";

interface ToolbarProps {
  title: string;
  subtitle?: string;
  onAddNew?: () => void;
  showAddButton?: boolean;
  invoice?: boolean;
  children?: React.ReactNode;
}

export default function Toolbar({
  title,
  subtitle,
  onAddNew,
  showAddButton = true,
  invoice = false,
  children,
}: ToolbarProps) {
  const t = useTranslations("toolbar");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1
          className="text-2xl font-bold text-white tracking-tight"
          style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.02em" }}
        >
          {title}
          <span style={{ color: "#4a7fff" }}>.</span>
        </h1>
        {subtitle && (
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {children}

        {showAddButton && !invoice && (
          <CustomButton
            text={t("add")}
            icon={CirclePlus}
            onClickButton={onAddNew}
            variant="primary"
          />
        )}

        <CustomButton text={t("imprimir")} icon={Printer} variant="ghost" />
      </div>
    </div>
  );
}
