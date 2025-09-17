import React, { forwardRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie"; 

import { ClientDAO } from "@/types/Api";
import Input from "@/components/atoms/Input";
import { updateCustomer } from "@/request/users";
import CustomButton from "@/components/atoms/CustomButton";
import { customertEditSchema } from "@/schemes/customerEditScheme";

type CustomerFormData = {
    id?: string;
    identification: string; 
    firstName: string;
    lastName: string;
    email: string; 
};

interface CustomerFormProps {
    client?: {    
        id?: string;
        identification: string; 
        firstName: string;
        lastName: string;
        email: string; 
    };
    onSuccess?: () => void; 
    onClose?: () => void;
}

const CustomerFormEdit = forwardRef<HTMLFormElement, CustomerFormProps>(({ onSuccess, client }, ref) => {
    const t = useTranslations("customerEdit");
    const editCustomerSchema = customertEditSchema(t); 

    const {
        register,
        handleSubmit,
        reset, 
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CustomerFormData>({
        resolver: zodResolver(editCustomerSchema),
    }); 

    useEffect(() => {
        if (client) {
            const formattedIdentification = client.identification.slice(2); 
            setValue('identification', formattedIdentification);
            setValue('firstName', client.firstName);
            setValue('lastName', client.lastName);
            setValue('email', client.email);
            
            if (client.id) {
                setValue('id', client.id);
            }
        } else {
            reset();
        }
    }, [client, reset, setValue]);      

    const onSubmit = async (data: CustomerFormData) => {
        const authToken = Cookies.get("authToken");
    
        if (!client?.id) {
            alert(t("alerts.noClientId"));
            return;
        }
    
        try {
            const requestBody: ClientDAO = {
                id: client.id,
                tenantId: "",
                identification: data.identification,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
            };
    
            const response = await updateCustomer(requestBody, client.id);
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || t("alerts.updateError"));
            }
    
            alert(t("alerts.updateSuccess"));
            if (onSuccess) onSuccess();
            
        } catch (error) {
            console.error("Error en onSubmit:", error);
        }
    };
    

    return (
        <form ref={ref} onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4"> 
            {client?.id && (
                <div className="col-span-2">
                    <label className="text-sm font-semibold text-gray-500">{t("fields.id")}</label>
                    <Input 
                        value={client.id}
                        type="text" 
                        disabled={true}
                        placeholder={t("placeholders.id")}
                    />
                </div>
            )}

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("fields.identification")}*</label>
                <Input 
                    placeholder={t("placeholders.identification")}
                    type="text" 
                    {...register("identification")} 
                    disabled={!!client?.id} 
                />
                {errors.identification && <p className="text-red-500 text-xs">{errors.identification.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("fields.firstName")}*</label>
                <Input 
                    placeholder={t("placeholders.firstName")}
                    type="text" 
                    {...register("firstName")} 
                />
                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("fields.lastName")}*</label>
                <Input 
                    placeholder={t("placeholders.lastName")}
                    type="text" 
                    {...register("lastName")} 
                />
                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("fields.email")}*</label>
                <Input 
                    placeholder={t("placeholders.email")}
                    type="email" 
                    {...register("email")} 
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            
            <div className="col-span-2 flex justify-end gap-2 mt-4">
                <CustomButton text={t("buttons.close")} style="border text-white bg-homePrimary hover:bg-blue-500" typeButton="button" onClickButton={onSuccess}  />
                <CustomButton
                    text={
                    isSubmitting
                        ? t("buttons.processing")
                        : client?.id
                        ? t("buttons.update")
                        : t("buttons.create")
                    }
                    style="border text-white bg-homePrimary hover:bg-blue-500"
                    typeButton="submit"
                />
            </div>
        </form>
    );
});

CustomerFormEdit.displayName = "CustomerFormEdit";
export default CustomerFormEdit;