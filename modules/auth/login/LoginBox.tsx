import React from "react";
import { useTranslations } from "next-intl";

import LoginForm from "./LoginForm";

const LoginBox: React.FC = () => {
    const t = useTranslations("login"); 
    
    return (
        <div className="flex flex-col items-center w-full max-w-md p-8 rounded-lg shadow-lg bg-white/10 backdrop-blur-md border border-white/20">
            <h1 className="font-bold text-white mb-5 text-4xl">{t("title")}</h1>
            <LoginForm />
        </div>
    );
};

export default LoginBox;