import { z } from "zod";
import { useTranslations } from "next-intl";

export const customertEditSchema = (t: ReturnType<typeof useTranslations>) => z.object({
    firstName: z.string()
            .nonempty({ message: t("errors.firstName.required") })
            .min(4, {message: t("errors.firstName.min") })
            .max(40)
			.refine(
				(value) => /^[a-zA-Z]+$/.test(value ?? ""),
				{ message: t("errors.firstName.invalid") }
			),

    lastName: z.string()
                .nonempty({ message: t("errors.lastName.required") })
                .min(4, {message: t("errors.lastName.min")})
                .max(40, { message: t("errors.lastName.max") })
                .refine(
                    (value) => /^[a-zA-Z]+$/.test(value ?? ""),
                    { message: t("errors.lastName.invalid") }
                ),

    email: z.string()
			.nonempty({ message: t("errors.email.required") })
			.email({message: t("errors.email.invalid") })
			.max(40, t("errors.email.max")),
});
