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
    birthDate: string;
    farmName: string;
    farmVereda: string;
    farmTotalHectares: number;
    farmCoffeeHectares: number;
    coffeeTrees: number;
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
        birthDate?: string;
        farmName?: string;
        farmVereda?: string;
        farmTotalHectares?: number;
        farmCoffeeHectares?: number;
        coffeeTrees?: number;
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
            // El backend puede devolver la fecha en ISO; el input date necesita YYYY-MM-DD
            setValue('birthDate', client.birthDate ? client.birthDate.slice(0, 10) : "");
            setValue('farmName', client.farmName || "");
            setValue('farmVereda', client.farmVereda || "");
            if (client.farmTotalHectares != null) setValue('farmTotalHectares', client.farmTotalHectares);
            if (client.farmCoffeeHectares != null) setValue('farmCoffeeHectares', client.farmCoffeeHectares);
            if (client.coffeeTrees != null) setValue('coffeeTrees', client.coffeeTrees);
            
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
                birthDate: data.birthDate,
                farmName: data.farmName,
                farmVereda: data.farmVereda,
                farmTotalHectares: data.farmTotalHectares,
                farmCoffeeHectares: data.farmCoffeeHectares,
                coffeeTrees: data.coffeeTrees,
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
            alert(error instanceof Error ? error.message : t("alerts.updateError"));
        }
    };
    

    return (
        <form ref={ref} onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4"> 
            {client?.id && (
                <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{t("fields.id")}</label>
                    <Input 
                        value={client.id}
                        type="text" 
                        disabled={true}
                    />
                </div>
            )}

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{t("fields.identification")}*</label>
                <Input 
                    type="text" 
                    {...register("identification")} 
                    disabled={!!client?.id} 
                />
                {errors.identification && <p className="text-red-500 text-xs">{errors.identification.message}</p>}
            </div>

            {/* Fila: Nombre y Segundo Nombre */}
            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{t("fields.firstName")}*</label>
                <Input type="text" {...register("firstName")} />
                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Segundo Nombre</label>
                <Input type="text" {...register("middleName")} />
            </div>

            {/* Fila: Apellido y Segundo Apellido */}
            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{t("fields.lastName")}*</label>
                <Input type="text" {...register("lastName")} />
                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Segundo Apellido</label>
                <Input type="text" {...register("secondLastName")} />
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Teléfono</label>
                <Input type="text" {...register("phone")} />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Fecha de Nacimiento*</label>
                <Input type="date" {...register("birthDate")} />
                {errors.birthDate && <p className="text-red-500 text-xs">{errors.birthDate.message}</p>}
            </div>

            {/* Datos de la finca */}
            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Nombre de la Finca*</label>
                <Input type="text" {...register("farmName")} />
                {errors.farmName && <p className="text-red-500 text-xs">{errors.farmName.message}</p>}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Vereda de la Finca*</label>
                <Input type="text" {...register("farmVereda")} />
                {errors.farmVereda && <p className="text-red-500 text-xs">{errors.farmVereda.message}</p>}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Hectáreas Totales*</label>
                <Input type="number" step="0.01" min="0" {...register("farmTotalHectares")} />
                {errors.farmTotalHectares && <p className="text-red-500 text-xs">{errors.farmTotalHectares.message}</p>}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Hectáreas en Café*</label>
                <Input type="number" step="0.01" min="0" {...register("farmCoffeeHectares")} />
                {errors.farmCoffeeHectares && <p className="text-red-500 text-xs">{errors.farmCoffeeHectares.message}</p>}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Número de Árboles de Café*</label>
                <Input type="number" step="1" min="0" {...register("coffeeTrees")} />
                {errors.coffeeTrees && <p className="text-red-500 text-xs">{errors.coffeeTrees.message}</p>}
            </div>

            <div className="col-span-2 flex justify-end gap-2 mt-4">
                <CustomButton text={t("buttons.close")} variant="ghost" typeButton="button" onClickButton={onSuccess}  />
                <CustomButton
                    text={isSubmitting ? t("buttons.processing") : t("buttons.update")}
                    variant="primary"
                    typeButton="submit"
                />
            </div>
        </form>
    );
});

CustomerFormEdit.displayName = "CustomerFormEdit";
export default CustomerFormEdit;