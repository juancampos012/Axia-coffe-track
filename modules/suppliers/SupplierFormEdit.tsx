import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import React, { forwardRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { SupplierDAO } from "@/types/Api";
import Input from "@/components/atoms/Input";
import { updateSupplier } from "@/lib/api-suppliers";
import { supplierSchema } from "@/schemes/supplierSchema";
import CustomButton from "@/components/atoms/CustomButton";

type SupplierFormData = {
    id: string;
    nit: string;
    name: string;
    phone: string;
    address: string;
};

interface SupplierFormProps {
    supplier?: {
        id: string;
        nit: string;
        name: string;
        phone: string;
        address: string;
    };
    onSuccess?: () => void;
    onClose?: () => void;
}

const SupplierFormEdit = forwardRef<HTMLFormElement, SupplierFormProps>(({ onSuccess, onClose, supplier }, ref) => {
    const t = useTranslations("supplierEdit");
    const editSupplierSchema = supplierSchema (t);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SupplierFormData>({
        resolver: zodResolver(editSupplierSchema),
    });

    useEffect(() => {
        if (supplier) {
            reset({
                ...supplier,
            });
        }
    }, [supplier, reset]);

    const onSubmit = async (data: SupplierFormData) => {
    
        if (!supplier?.id) {
            alert(t("error.noId"));
            return;
        }
    
        try {
    
            const requestBody: SupplierDAO = {
                id: supplier.id, 
                nit: data.nit,
                name: data.name,
                phone: data.phone,
                address: data.address,
                tenantId: "",
            };
    
            const response = await updateSupplier(requestBody, supplier.id);
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || t("error.update"));
            }
    
            alert(t("success.updated"));
            if (onSuccess) onSuccess();
            
        } catch (error) {
            console.error("Error en onSubmit:", error);
        }
    };

    return (
        <form ref={ref} onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-sm font-semibold text-gray-500">{t("fields.id")}</label>
                <Input placeholder={t("placeholders.id")} type="text" disabled={true} {...register("id")}/>
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("fields.name")}</label>
                <Input 
                    placeholder={t("placeholders.name")} 
                    type="text" 
                    {...register("name")}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("fields.nit")}</label>
                <Input  
                    placeholder={t("placeholders.nit")}
                    type="text" 
                    {...register("nit")}
                />
                {errors.nit && <p className="text-red-500 text-xs">{errors.nit.message}</p>}
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-500">{t("fields.phone")}</label>
                <Input 
                    placeholder={t("placeholders.phone")}
                    type="text" 
                    {...register("phone")}
                />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>


            <div>
                <label className="text-sm font-semibold text-gray-500">{t("fields.address")}</label>
                <Input 
                    placeholder={t("placeholders.address")}
                    type="text" 
                    {...register("address")}
                />
                {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
            </div>

            <div className="col-span-2 flex justify-end gap-2 mt-4">
            <div className="col-span-2 flex justify-end gap-2 mt-4">
                <CustomButton text={t("buttons.close")} style="border text-white bg-homePrimary hover:bg-blue-500" typeButton="button" onClickButton={onSuccess}  />
                <CustomButton text={t("buttons.update")} style="border text-white bg-homePrimary hover:bg-blue-500" typeButton="submit" />
            </div>   
            </div>
        </form>
    );
});

SupplierFormEdit.displayName = "SupplierForm";
export default SupplierFormEdit;