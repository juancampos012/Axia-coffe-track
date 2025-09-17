import React, { forwardRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { EmployeeDAO } from "@/types/Api";
import Input from "@/components/atoms/Input";
import { updateEmployee } from "@/request/users";
import CustomButton from "@/components/atoms/CustomButton";
import { employeeEditSchema } from "@/schemes/employeeEditScheme";

type EmployeeFormData = {
    id?: string;
    tenantId: string;
    name: string;
    email: string;
    password?: string;
    role: string;
    avatar: string;
};

interface EmployeeFormProps {
    employee?: {
        id?: string;
        name: string;
        email: string;
        role: string;
    };
    onSuccess?: () => void;
}

const EmployeeFormEdit = forwardRef<HTMLFormElement, EmployeeFormProps>(({ employee, onSuccess }, ref) => {
    const t = useTranslations("employeeForm");
    const editEmployeeSchema = employeeEditSchema(t)

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<EmployeeFormData>({
        resolver: zodResolver(editEmployeeSchema),
    });

    useEffect(() => {
        if (employee) {
            reset({
                ...employee,
                password: "",
                tenantId: "", 
                avatar: "", 
            });
        }
    }, [employee, reset]);

    const onSubmit = async (data: EmployeeFormData) => {
    
        if (!employee?.id) {
            alert(t("noIdError"));
            return;
        }
    
        try {
    
            const requestBody: EmployeeDAO = {
                id: employee.id, 
                name: data.name,
                role: data.role,
                email: data.email,
            };
    
            const response = await updateEmployee(requestBody, employee.id);
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || t("updateError"));
            }
    
            alert(t("updateSuccess"));
            if (onSuccess) onSuccess();
            
        } catch (error) {
            console.error(t("errorSubmit"), error);
        }
    };


    return (
        <form ref={ref} onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <label className="text-sm font-semibold text-gray-500">{t("id")}</label>
                <Input
                    placeholder={t("generated")}
                    type="text"
                    disabled
                    {...register("id")}
                />
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("role")}</label>
                <Input 
                    placeholder={t("roleExample")} 
                    type="text" 
                    disabled
                    {...register("role")} 
                />
                {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("name")}</label>
                <Input 
                    placeholder={t("nameExample")}
                    type="text" 
                    {...register("name")} 
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("email")}</label>
                <Input 
                    placeholder={t("emailExample")} 
                    type="email" 
                    {...register("email")} 
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">
                    {employee?.id ? t("newPassword") : t("password")}
                </label>
                <Input 
                    placeholder={t("password")}
                    type="password" 
                    {...register("password")} 
                />
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <div className="col-span-2 flex justify-end gap-2 mt-4">
                <CustomButton text={t("close")} style="border text-white bg-homePrimary hover:bg-blue-500" typeButton="button" onClickButton={onSuccess}  />
                <CustomButton text={employee?.id ? t("update") : t("create")} style="border text-white bg-homePrimary hover:bg-blue-500" typeButton="submit" />
            </div>
        </form>
    );
});

EmployeeFormEdit.displayName = "EmployeeFormEdit";
export default EmployeeFormEdit;