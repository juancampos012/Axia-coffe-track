import Cookies from "js-cookie"; 
import { jwtDecode } from "jwt-decode";
import React, { forwardRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "@/components/atoms/Input";
import { createCustomer } from "@/request/users";
import CustomButton from "@/components/atoms/CustomButton";
import { customertSchema } from "@/schemes/customerScheme";

type CustomerFormData = {
    tenantId: string;
    identification: string; 
    firstName: string;
    lastName: string;
    email: string; 
};

interface CustomerFormProps {
    onSuccess?: () => void; 
}

const CustomerForm = forwardRef<HTMLFormElement, CustomerFormProps>(({ onSuccess }, ref) => {
    const t = useTranslations("customerForm"); 
    const createCustomerSchema = customertSchema(t) 

    const {
        register,
        handleSubmit,
        reset, 
        formState: { errors },
    } = useForm<CustomerFormData>({
        resolver: zodResolver(createCustomerSchema),
    });

    const onSubmit = async (data: CustomerFormData) => {
        const authToken = Cookies.get("authToken");
        if (!authToken) {
            throw new Error(t("authTokenMissing"));
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
        const response = await createCustomer(formData, authToken);

        if (response.status === 201) {
            const responseData = await response.json();
            alert(t("successMessage"));
            reset(); 
            if (onSuccess) onSuccess();
        } else {
            const errorData = await response.json();
            console.log(t("creationError"), errorData);
        }
        } catch (error) {
        console.error(error);
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
                <label className="text-sm font-semibold text-gray-500">{t("identificationLabel")}</label>
                <Input 
                    className="text-homePrimary-200 bg-transparent" 
                    placeholder={t("identificationPlaceholder")} 
                    type="text" 
                    {...register("identification")} 
                />
                {errors.identification && <p className="text-red-500 text-xs">{errors.identification.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("firstNameLabel")}</label>
                <Input 
                    className="text-homePrimary-200 bg-transparent" 
                    placeholder={t("firstNamePlaceholder")} 
                    type="text" 
                    {...register("firstName")} 
                />
                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("lastNameLabel")}</label>
                <Input 
                    className="text-homePrimary-200 bg-transparent" 
                    placeholder={t("lastNamePlaceholder")}  
                    type="text" 
                    {...register("lastName")} 
                />
                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("emailLabel")}</label>
                <Input 
                    className="text-homePrimary-200 bg-transparent" 
                    placeholder={t("emailPlaceholder")} 
                    type="email" 
                    {...register("email")} 
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="col-span-2 flex justify-end gap-2 mt-4">
                <CustomButton text={t("closeButton")} style="border text-white bg-homePrimary hover:bg-blue-500" typeButton="button" onClickButton={onSuccess}  />
                <CustomButton text={t("submitButton")} style="border text-white bg-homePrimary hover:bg-blue-500" typeButton="submit" />
            </div>               
            
        </form>
    );
});

CustomerForm.displayName = "CustomerForm";
export default CustomerForm;