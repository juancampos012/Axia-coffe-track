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

type LoginFormData = {
  email: string;
  password: string;
};

const LoginForm: React.FC = () => {
  const locale = useLocale();
  const t = useTranslations('login');
  const loginValidationSchema = loginScheme(t);
  const { setBalance } = useBalance();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
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

      const authToken = document.cookie
        .split("; ")
        .find(row => row.startsWith("authToken="))
        ?.split("=")[1];

      if (!authToken) {
        throw new Error("No se encontró token después del login");
      }

      const payload = JSON.parse(atob(authToken.split(".")[1]));
      const userRole = payload.role;
      const tenantId = payload.tenantId;

      try {
        const balanceData = await getCompanyById(tenantId);
        setBalance(balanceData.currentBalance);
      } catch (e) {
        console.error("Error fetching balance:", e);
      }

      if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
        router.push(`/${locale}/admin`);
      } else if (userRole === "USER") {
        router.push(`/${locale}/employee`);
      } else {
        router.push(`/${locale}/`);
      }

    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || t("connectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        className="w-full items-center pl-3 pr-3 mt-12"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="w-full mb-3">
          <Input
            placeholder={t("emailPlaceholder")}
            {...register("email")}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div className="w-full mb-7">
          <Input
            placeholder={t("passwordPlaceholder")}
            type="password"
            {...register("password")}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        {errorMessage && (
          <div className="w-full mb-4">
            <p className="text-red-500 text-sm">{errorMessage}</p>
          </div>
        )}

        <div className="w-full">
          <CustomButton
            text={loading ? t("loading") : t("loginButton")}
            style="w-full text-white bg-homePrimary"
            typeButton='submit'
            disabled={loading}
          />
        </div>
      </form>

      <div className="w-full items-center pl-3 pr-3">
        <div className="flex justify-between w-full text-sm text-white mt-2">
          <p>{t("forgotPassword")}</p>
        </div>

        <div className="relative flex items-center w-full my-4">
          <span className="flex-grow border-t border-gray-300"></span>
          <span className="px-2 text-white text-sm">{t("orContinueWith")}</span>
          <span className="flex-grow border-t border-gray-300"></span>
        </div>

        <div className="flex flex-row space-x-5 mt-2">
          <CustomButton
            text="Google"
            icon={GoogleIcon}
            style="w-11/12 text-white bg-homePrimary"
            onClickButton={() => {}}
            typeButton="button"
          />

          <CustomButton
            text="Apple"
            icon={AppleIcon}
            style="w-11/12 text-white bg-homePrimary"
            onClickButton={() => {}}
            typeButton="button"
          />
        </div>
      </div>
    </>
  );
};

export default LoginForm;