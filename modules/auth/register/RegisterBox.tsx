import React from "react";
import { useTranslations } from "next-intl";

import RegisterForm from "./RegisterForm";


const RegisterBox: React.FC = () => {
    const t = useTranslations("register");

    return (
        <div className="flex flex-col items-center w-full max-w-md ">
            <h1 className="text-4xl font-bold mb-6">{t("title")}</h1>
            <RegisterForm/>
        </div>
    );
};

export default RegisterBox;