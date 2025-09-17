"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";

import Select from "@/components/atoms/select";
import { registerUser } from "@/request/access";
import Input from "../../../components/atoms/Input";
import { registerScheme } from "@/schemes/registerScheme";
import CustomButton from "../../../components/atoms/CustomButton";
import { AppleIcon, GoogleIcon } from "../../../components/atoms/icons";

type RegisterFormData = {
  name: string;
  role: string;
  email: string;
  password: string;
};

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const t = useTranslations("register");
  const locale = useLocale();
  const registerSchema = registerScheme(t);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log("Iniciando petición al servidor...");
      const response = await registerUser(data);
      console.log("Respuesta recibida:", response.status);

      if (response.status === 201) {
        const responseData = await response.json();
        console.log("Registro exitoso:", responseData);
        router.push(`/${locale}/login`);
      } else {
        const errorData = await response.json().catch(() => ({
          message: t("unknownServerError")
        }));
        console.error("Registro fallido:", errorData);
        setSubmitError(errorData.message || response.statusText);
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      setSubmitError(t("unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    console.error("Errores de validación:", errors);
  };

  return (
    <>
      <form
        className="w-full flex flex-col items-center pl-3 pr-3"
        onSubmit={(e) => {
          console.log("Evento submit del formulario");
          e.preventDefault();
          handleSubmit(onSubmit, onError)();
        }}
        noValidate
      >
        <div className="w-full mb-3">
          <Input placeholder={t("placeholders.name")} type="text" {...register("name")} />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="w-full mb-3">
          <Select
            options={[
              { value: "ADMIN", label: t("roles.admin") },
              { value: "USER", label: t("roles.user") },
              { value: "EDITOR", label: t("roles.editor") },
            ]}
            disabled={false}
            {...register("role")}
          />
          {errors.role && (
            <p className="text-red-500 text-sm">{errors.role.message}</p>
          )}
        </div>

        <div className="w-full mb-3">
          <Input
            placeholder={t("placeholders.email")}
            type="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="w-full mb-3">
          <Input
            placeholder={t("placeholders.password")}
            type="password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        {submitError && (
          <div className="w-full mb-3">
            <p className="text-red-500 text-sm">{submitError}</p>
          </div>
        )}

        <div className="w-full">
          <CustomButton
            text={isSubmitting ? t("buttons.sending") : t("buttons.createAccount")}
            style="w-full text-white bg-secondary"
            typeButton="submit"
            disabled={isSubmitting}
          />
        </div>
      </form>

      <div className="w-full items-center pl-3 pr-3">
        <div className="justify-center pt-7 flex flex-row gap-2">
          <p className="text-sm text-center">{t("joinedBefore")}</p>
          <Link href={`/${locale}/login`} className="text-secondary">
            <p className="text-sm text-center">
              {t("buttons.login")}
            </p>
          </Link>
        </div>

        <div className="relative flex items-center w-full my-4">
          <span className="flex-grow border-t border-gray-300"></span>
          <span className="px-2 text-gray-500 text-sm">{t("orContinueWith")}</span>
          <span className="flex-grow border-t border-gray-300"></span>
        </div>

        <div className="flex flex-row space-x-5 mt-2">
          <CustomButton
            text="Google"
            icon={GoogleIcon}
            style="w-11/12 text-white bg-secondary"
            onClickButton={() => {}}
            typeButton="button"
          />

          <CustomButton
            text="Apple"
            icon={AppleIcon}
            style="w-11/12 text-white bg-secondary"
            onClickButton={() => {}}
            typeButton="button"
          />
        </div>
      </div>
    </>
  );
};

export default RegisterForm;