import { z } from "zod";
import { useTranslations } from "next-intl";

export const employeeEditSchema = (t: ReturnType<typeof useTranslations>) => z.object({
    name: z.string()
            .min(3, { message: t("errors.name.min") })
            .max(50, { message: t("errors.name.max") }),

    role: z.enum(["USER", "ADMIN"], {
            required_error: t("errors.role.required"),
    }),

    email: z.string()
            .email({ message: t("errors.email.invalid") })
            .max(100, { message: t("errors.email.max") }),

    password: z.string()
                .min(6, { message: t("errors.password.min") })
                .max(50, { message: t("errors.password.max") })
                .optional()
                .or(z.literal('')),
  });