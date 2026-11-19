'use client'

import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import React, { forwardRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "@/components/atoms/Input";
import { createCustomer } from "@/request/users";
import CustomButton from "@/components/atoms/CustomButton";
import { customertSchema } from "@/schemes/customerScheme";

type CustomerFormData = {
    tenantId: string;
    identification: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    secondLastName?: string;
    phone?: string;
    birthDate: string;
    farmName: string;
    farmVereda: string;
    farmTotalHectares: number;
    farmCoffeeHectares: number;
    coffeeTrees: number;
};

interface CustomerFormProps {
    onSuccess?: () => void;
}

const CustomerForm = forwardRef<HTMLFormElement, CustomerFormProps>(
({ onSuccess }, ref) => {
    const createCustomerSchema = customertSchema();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
        if (!authToken) return;

        const decoded: any = jwtDecode(authToken);

        const formData = {
            ...data,
            tenantId: decoded.tenantId,
            id: "",
        };

        try {
            const response = await createCustomer(formData as any);

            if (response.status === 201) {
                alert("Cliente creado correctamente");
                reset();
                onSuccess?.();
            }
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Error de conexión");
        }
    };

    if (!mounted) return null;

    return (
        <form ref={ref} onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">

            <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Identificación</label>
                <Input
placeholder="Ingrese identificación"
                    {...register("identification")}
                />
                {errors.identification && (
                    <p className="text-red-500 text-xs">{errors.identification.message}</p>
                )}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Primer Nombre</label>
                <Input
{...register("firstName")}
                />
                {errors.firstName && (
                    <p className="text-red-500 text-xs">{errors.firstName.message}</p>
                )}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Segundo Nombre</label>
                <Input
placeholder="Opcional"
                    {...register("middleName")}
                />
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Primer Apellido</label>
                <Input
{...register("lastName")}
                />
                {errors.lastName && (
                    <p className="text-red-500 text-xs">{errors.lastName.message}</p>
                )}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Segundo Apellido</label>
                <Input
placeholder="Opcional"
                    {...register("secondLastName")}
                />
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Teléfono</label>
                <Input
type="text"
                    {...register("phone")}
                />
                {errors.phone && (
                    <p className="text-red-500 text-xs">{errors.phone.message}</p>
                )}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Fecha de Nacimiento</label>
                <Input
type="date"
                    {...register("birthDate")}
                />
                {errors.birthDate && (
                    <p className="text-red-500 text-xs">{errors.birthDate.message}</p>
                )}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Nombre de la Finca</label>
                <Input
placeholder="Ej: La Esperanza"
                    {...register("farmName")}
                />
                {errors.farmName && (
                    <p className="text-red-500 text-xs">{errors.farmName.message}</p>
                )}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Vereda de la Finca</label>
                <Input
placeholder="Ingrese la vereda"
                    {...register("farmVereda")}
                />
                {errors.farmVereda && (
                    <p className="text-red-500 text-xs">{errors.farmVereda.message}</p>
                )}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Hectáreas Totales</label>
                <Input
type="number"
                    step="0.01"
                    min="0"
                    {...register("farmTotalHectares")}
                />
                {errors.farmTotalHectares && (
                    <p className="text-red-500 text-xs">{errors.farmTotalHectares.message}</p>
                )}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Hectáreas en Café</label>
                <Input
type="number"
                    step="0.01"
                    min="0"
                    {...register("farmCoffeeHectares")}
                />
                {errors.farmCoffeeHectares && (
                    <p className="text-red-500 text-xs">{errors.farmCoffeeHectares.message}</p>
                )}
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Número de Árboles de Café</label>
                <Input
type="number"
                    step="1"
                    min="0"
                    {...register("coffeeTrees")}
                />
                {errors.coffeeTrees && (
                    <p className="text-red-500 text-xs">{errors.coffeeTrees.message}</p>
                )}
            </div>

            <div className="col-span-2 flex justify-end gap-2 mt-4">
                <CustomButton
                    text="Cerrar"
                    variant="ghost"
                    typeButton="button"
                    onClickButton={onSuccess}
                />
                <CustomButton
                    text="Guardar Cliente"
                    variant="primary"
                    typeButton="submit"
                />
            </div>
        </form>
    );
});

CustomerForm.displayName = "CustomerForm";

export default CustomerForm;