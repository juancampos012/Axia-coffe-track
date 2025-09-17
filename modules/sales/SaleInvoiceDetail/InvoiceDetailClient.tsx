"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import CustomButton from "@/components/atoms/CustomButton";
import { Invoice } from "@/types/Api";

interface InvoiceDetailClientProps {
    invoice: Invoice;
}

export default function InvoiceDetailClient({ invoice }: InvoiceDetailClientProps) {
    const router = useRouter();
    const t = useTranslations("invoiceDetail");

    return (
        <div className="relative w-full min-h-screen text-white flex justify-center">
            <Image 
                src="/Images/fondoHerooo.png" 
                alt="Background Image" 
                fill 
                className="absolute top-0 left-0 w-full h-full object-cover"
                priority
            />

            <div className="relative w-full max-w-4xl bg-blac bg-opacity-50 rounded-lg shadow-lg mt-20">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-tertiary">{t("title")}</h1>
                    <CustomButton 
                        text={t("backButton")} 
                        style="bg-tertiary text-white hover:bg-blue-800"
                        onClickButton={() => router.back()}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información general de la factura */}
                    <div className="p-4 border border-gray-600 rounded-lg">
                        <p className="text-sm text-gray-400 mb-2">{t("invoiceId")}</p>
                        <p>{invoice.id}</p>
                    </div>

                    <div className="p-4 border border-gray-600 rounded-lg">
                        <p className="text-sm text-gray-400 mb-2">{t("date")}</p>
                        <p>{new Date(invoice.date).toLocaleString()}</p>
                    </div>

                    <div className="p-4 border border-gray-600 rounded-lg">
                        <p className="text-sm text-gray-400 mb-2">{t("electronic")}</p>
                        <p>{invoice.electronicBill ? t("yes") : t("no")}</p>
                    </div>

                    <div className="p-4 border border-gray-600 rounded-lg">
                        <p className="text-sm text-gray-400 mb-2">Total</p>
                        <p>${invoice.totalPrice?.toFixed(2)}</p>
                    </div>

                    {/* Cliente */}
                    <div className="md:col-span-2 bg-transparent border border-gray-600 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 text-tertiary">{t("clientSection")}</h3>
                        <p>{t("client.name")} {invoice.client.firstName} {invoice.client.lastName}</p>
                        <p>{t("client.id")}: {invoice.client.identification}</p>
                        <p>{t("client.email")}: {invoice.client.email}</p>
                        <p>{t("client.clientId")}: {invoice.client.id}</p>
                    </div>

                    {/* Empresa / Tenant */}
                    <div className="md:col-span-2 bg-transparent border border-gray-600 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 text-tertiary">{t("companySection")}</h3>
                        <p>{t("company.name")}: {invoice.tenant.name}</p>
                        <p>{t("company.nit")}: {invoice.tenant.nit}</p>
                        <p>{t("company.address")}: {invoice.tenant.address}</p>
                        <p>{t("company.phone")}: {invoice.tenant.phone}</p>
                    </div>

                    <div className="md:col-span-2 bg-transparent border border-gray-600 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 text-tertiary">{t("productsSection")}</h3>
                        {invoice.invoiceProducts.length === 0 ? (
                            <p>{t("noProducts")}</p>
                        ) : (
                            <ul className="list-disc pl-5 space-y-2">
                            {invoice.invoiceProducts.map((item) => (
                                <li key={item.id}>
                                <p><span className="text-gray-400">{t("product")}:</span> {item.product?.name}</p> 
                                <p><span className="text-gray-400">{t("quantity")}:</span> {item.quantity}</p>
                                </li>
                            ))}
                            </ul>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
