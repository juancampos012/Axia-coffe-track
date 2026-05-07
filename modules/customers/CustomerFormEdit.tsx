'use client'

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

// 1. Agregamos los campos al tipo de datos del formulario
type CustomerFormData = {
    id?: string;
    identification: string; 
    firstName: string;
    middleName?: string;  // Nuevo
    lastName: string;
    secondLastName?: string; // Nuevo
    phone?: string;
    email: string; 
};

// 2. Actualizamos la interfaz de las Props para que coincida con lo que envías desde la tabla
interface CustomerFormProps {
    client?: {    
        id?: string;
        identification: string; 
        firstName: string;
        middleName?: string; // Nuevo
        lastName: string;
        secondLastName?: string; // Nuevo
        phone?: string;
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

    // 3. Cargamos los valores iniciales cuando se abre el modal
    useEffect(() => {
        if (client) {
            // Suponiendo que el prefijo de identificación se maneja igual
            const formattedIdentification = client.identification.includes('-') 
                ? client.identification.split('-')[1] 
                : client.identification;

            setValue('identification', formattedIdentification);
            setValue('firstName', client.firstName);
            setValue('middleName', client.middleName || "");
            setValue('lastName', client.lastName);
            setValue('secondLastName', client.secondLastName || "");
            setValue('phone', client.phone || "");
            setValue('email', client.email);
            
            if (client.id) {
                setValue('id', client.id);
            }
        } else {
            reset();
        }
    }, [client, reset, setValue]);      

    const onSubmit = async (data: CustomerFormData) => {
        if (!client?.id) {
            alert(t("alerts.noClientId"));
            return;
        }
    
        try {
            // 4. Enviamos el objeto completo al backend
            const requestBody: ClientDAO = {
                id: client.id,
                tenantId: "", // El backend suele tomar esto del token
                identification: data.identification,
                firstName: data.firstName,
                middleName: data.middleName,
                lastName: data.lastName,
                secondLastName: data.secondLastName,
                phone: data.phone || "",
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
                    <label className="text-sm font-semibold text-zinc-500">{t("fields.id")}</label>
                    <Input 
                        value={client.id}
                        type="text" 
                        disabled={true}
                    />
                </div>
            )}

            <div>
                <label className="text-sm font-semibold text-zinc-500">{t("fields.identification")}*</label>
                <Input 
                    type="text" 
                    {...register("identification")} 
                    disabled={!!client?.id} 
                />
                {errors.identification && <p className="text-red-500 text-xs">{errors.identification.message}</p>}
            </div>

            {/* Fila: Nombre y Segundo Nombre */}
            <div>
                <label className="text-sm font-semibold text-zinc-500">{t("fields.firstName")}*</label>
                <Input type="text" {...register("firstName")} />
                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-zinc-500">Segundo Nombre</label>
                <Input type="text" {...register("middleName")} />
            </div>

            {/* Fila: Apellido y Segundo Apellido */}
            <div>
                <label className="text-sm font-semibold text-zinc-500">{t("fields.lastName")}*</label>
                <Input type="text" {...register("lastName")} />
                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-zinc-500">Segundo Apellido</label>
                <Input type="text" {...register("secondLastName")} />
            </div>

            {/* Fila: Email y Teléfono */}
            <div>
                <label className="text-sm font-semibold text-zinc-500">{t("fields.email")}*</label>
                <Input type="email" {...register("email")} />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-zinc-500">Teléfono</label>
                <Input type="text" {...register("phone")} />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>
            
            <div className="col-span-2 flex justify-end gap-2 mt-4">
                <CustomButton text={t("buttons.close")} style="border text-white bg-zinc-800" typeButton="button" onClickButton={onSuccess}  />
                <CustomButton
                    text={isSubmitting ? t("buttons.processing") : t("buttons.update")}
                    style="border text-white bg-homePrimary hover:bg-blue-500"
                    typeButton="submit"
                />
            </div>
        </form>
    );
});

CustomerFormEdit.displayName = "CustomerFormEdit";
export default CustomerFormEdit;