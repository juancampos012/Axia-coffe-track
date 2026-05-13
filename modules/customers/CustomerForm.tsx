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
    email?: string;
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
            const response = await createCustomer(formData as any, authToken);

            if (response.status === 201) {
                alert("Cliente creado correctamente");
                reset();
                onSuccess?.();
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
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
            </div>

            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Correo Electrónico</label>
                <Input
type="email"
                    {...register("email")}
                />
                {errors.email && (
                    <p className="text-red-500 text-xs">{errors.email.message}</p>
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