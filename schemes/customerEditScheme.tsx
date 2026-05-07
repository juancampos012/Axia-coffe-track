import { z } from "zod";
import { useTranslations } from "next-intl";

export const customertEditSchema = (t: ReturnType<typeof useTranslations>) => z.object({
    firstName: z.string()
            .nonempty({ message: t("errors.firstName.required") })
            .min(3, {message: t("errors.firstName.min") }) // Bajé a 3 por nombres cortos
            .max(40)
            .refine(
                (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value ?? ""), 
                { message: t("errors.firstName.invalid") }
            ),

    // NUEVO: Segundo Nombre (Opcional)
    middleName: z.string()
            .max(40)
            .refine(
                (value) => !value || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value),
                { message: t("errors.firstName.invalid") }
            )
            .optional()
            .or(z.literal("")),

    lastName: z.string()
                .nonempty({ message: t("errors.lastName.required") })
                .min(3, {message: t("errors.lastName.min")})
                .max(40, { message: t("errors.lastName.max") })
                .refine(
                    (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value ?? ""),
                    { message: t("errors.lastName.invalid") }
                ),

    // NUEVO: Segundo Apellido (Opcional)
    secondLastName: z.string()
                .max(40)
                .refine(
                    (value) => !value || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value),
                    { message: t("errors.lastName.invalid") }
                )
                .optional()
                .or(z.literal("")),

    // NUEVO: Teléfono (Opcional)
    phone: z.string()
            .min(10)
            .max(10)
            .or(z.literal("")),

    email: z.string()
            .nonempty({ message: t("errors.email.required") })
            .email({message: t("errors.email.invalid") })
            .max(40, t("errors.email.max")),
});