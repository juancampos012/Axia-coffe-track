import React from "react";
import { useTranslations } from "next-intl";
import LoginForm from "./LoginForm";

const LoginBox: React.FC = () => {
  const t = useTranslations("login");

  return (
    <div className="flex flex-col items-center w-full p-8">
      <h1
        className="font-bold text-white mb-1 text-3xl w-full"
        style={{ fontFamily: 'inherit', letterSpacing: '-0.02em' }}
      >
        {t("title")}
      </h1>
      <p className="text-sm w-full mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
        { "Accede a tu cuenta para continuar"}
      </p>
      <LoginForm />
    </div>
  );
};

export default LoginBox;