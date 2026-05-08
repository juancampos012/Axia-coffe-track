"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Input from "../../../components/atoms/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginScheme } from "../../../schemes/loginScheme";
import CustomButton from "../../../components/atoms/CustomButton";
import { AppleIcon, GoogleIcon } from "../../../components/atoms/icons";
import { useLocale, useTranslations } from 'next-intl';
import { useBalance } from "@/context/BalanceContext";
import { getCompanyById } from '@/request/companies';
import { useAuth } from '@/context/AuthContext';

type LoginFormData = { email: string; password: string; };

const LoginForm: React.FC = () => {
  const locale = useLocale();
  const t = useTranslations('login');
  const loginValidationSchema = loginScheme(t);
  const { setBalance } = useBalance();
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginValidationSchema),
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setErrorMessage("");
    try {
      await login(data.email, data.password);
      const authToken = document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1];
      if (!authToken) throw new Error("No se encontró token después del login");
      const payload = JSON.parse(atob(authToken.split(".")[1]));
      try {
        const balanceData = await getCompanyById(payload.tenantId);
        setBalance(balanceData.currentBalance);
      } catch (e) { console.error("Error fetching balance:", e); }
      if (payload.role === "ADMIN" || payload.role === "SUPERADMIN") router.push(`/${locale}/admin`);
      else if (payload.role === "USER") router.push(`/${locale}/employee`);
      else router.push(`/${locale}/`);
    } catch (error: any) {
      setErrorMessage(error.message || t("connectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="w-full mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full mb-7">
          <Input placeholder={t("emailPlaceholder")} {...register("email")} />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div className="w-full mb-2">
          <Input placeholder={t("passwordPlaceholder")} type="password" {...register("password")} />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {errorMessage && <p className="text-red-400 text-xs mb-3">{errorMessage}</p>}

        {/* Olvidé contraseña */}
        <div className="w-full flex justify-end mb-5">
          <button
            type="button"
            className="text-xs transition-colors"
            style={{ color: 'rgba(74,127,255,0.75)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(120,170,255,1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(74,127,255,0.75)')}
          >
            {t("forgotPassword")}
          </button>
        </div>

        <div className="w-full">
          <CustomButton
            text={loading ? t("loading") : t("loginButton")}
            style="w-full text-white bg-homePrimary hover:bg-homePrimary-400 transition-colors"
            typeButton="submit"
            disabled={loading}
          />
        </div>
      </form>
    </>
  );
};

export default LoginForm;