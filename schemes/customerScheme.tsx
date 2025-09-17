import { z } from "zod";
import { useTranslations } from "next-intl";

export const customertSchema = (t: ReturnType<typeof useTranslations>) => z.object({
    firstName: z.string()
            .nonempty({ message: t("errors.firstName.required") })
            .min(4, {message: t("errors.firstName.min") })
            .max(40, t("errors.firstName.max"))
			.refine(
				(value) => /^[a-zA-Z]+$/.test(value ?? ""),
				{ message: t("errors.firstName.invalid") }
			),

    lastName: z.string()
                .nonempty({ message: t("errors.lastName.required")  })
                .min(4, {message: t("errors.lastName.min") })
                .max(40, t("errors.lastName.max"))
                .refine(
                    (value) => /^[a-zA-Z]+$/.test(value ?? ""),
                    { message: t("errors.lastName.invalid") }
                ),

    identification: z.string()
                .nonempty({ message: t("errors.identification.required") })
                .min(6, {message: t("errors.identification.min")})
                .max(15, {message: t("errors.identification.max")})
                .refine(
                    (value) => /^[0-9]+$/.test(value ?? ""),
                     { message: t("errors.identification.invalid") }
                ),

    email: z.string()
			.nonempty({ message: t("errors.email.required") })
			.email({message: t("errors.email.invalid") })
			.max(40, t("errors.email.max")),
});