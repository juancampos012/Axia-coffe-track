import Cookies from "js-cookie"; 
import { jwtDecode } from "jwt-decode";
import React, { forwardRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from 'next-intl';
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "@/components/atoms/Input";
import { createEmployee } from "@/request/users";
import { employeeSchema } from "@/schemes/employeeScheme";
import CustomButton from "@/components/atoms/CustomButton";

type EmployeeFormData = {
    tenantId: string;
    name: string; 
    email: string; 
    password: string;
    role: string;
    avatar: string; 
};

interface EmployeeFormProps {
    onSuccess?: () => void; 
    onClose?: () => void;  
}

const EmployeeForm = forwardRef<HTMLFormElement, EmployeeFormProps>(({ onSuccess, onClose }, ref) => {
    const t = useTranslations("EmployeeForm");
    const createEmployeeSchema = employeeSchema(t);

    const {
        register,
        handleSubmit,
        reset, 
        formState: { errors },
    } = useForm<EmployeeFormData>({
        resolver: zodResolver(createEmployeeSchema),
    });

    const onSubmit = async (data: EmployeeFormData) => {
        const authToken = Cookies.get("authToken");
        if (!authToken) {
            console.error("No hay authToken");
            throw new Error("Authentication token is missing");
        }
        
        const decoded: any = jwtDecode(authToken);
        const tenantId = decoded.tenantId;
        
        const formData = {
            ...data,         
            tenantId,
            id: "", 
        };

        console.log("Datos enviados:", formData);
        
        try {                
            const response = await createEmployee(formData, authToken);
            console.log("Respuesta del servidor:", response);

            if (response.status === 201) {
                const responseData = await response.json();
                alert(t("success"));
                console.log("Empleado creado:", responseData);
                reset(); 
                onSuccess?.();
                onClose?.();
            } else {
                const errorData = await response.json();
                console.log("Error al crear el empleado:", errorData);
            }
        } catch (error) {
            console.error("Error en onSubmit:", error);
            alert(t("connectionError"));
        }   
    };

    return (
        <form ref={ref} onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4"> 
            <div>
                <label className="text-sm font-semibold text-gray-500">{t("codeLabel")}</label>
                <Input placeholder={t("codePlaceholder")} type="text" disabled={true} />
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("nameLabel")}</label>
                <Input 
                    className="text-homePrimary-200 bg-transparent" 
                    placeholder={t("namePlaceholder")}
                    type="text" 
                    {...register("name")} 
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("namePlaceholder")}</label>
                <Input 
                    className="text-homePrimary-200 bg-transparent" 
                    placeholder={t("emailPlaceholder")}
                    type="email" 
                    {...register("email")} 
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("passwordLabel")}</label>
                <Input 
                    className="text-homePrimary-200 bg-transparent" 
                    placeholder={t("passwordPlaceholder")}
                    type="password" 
                    {...register("password")} 
                />
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("roleLabel")}</label>
                <Input 
                    className="text-homePrimary-200 bg-transparent" 
                    placeholder={t("rolePlaceholder")} 
                    type="text" 
                    {...register("role")} 
                />
                {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
            </div>

            <div className="col-span-2 flex justify-end gap-2 mt-4">
                <CustomButton text={t("closeButton")} style="border text-white bg-homePrimary hover:bg-blue-500" typeButton="button" onClickButton={onSuccess}  />
                <CustomButton text={t("createButton")} style="border text-white bg-homePrimary hover:bg-blue-500" typeButton="submit" />
            </div>    
        </form>
    );
});

EmployeeForm.displayName = "EmployeeForm";
export default EmployeeForm;