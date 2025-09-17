import { z } from "zod";
import { useTranslations } from "next-intl";

export const employeeSchema = (t: ReturnType<typeof useTranslations>) => z.object({
    name: z.string()
        .min(3, t("errors.nameMin"))
        .max(50, t("errors.nameMax")),
    role: z.enum(["USER", "ADMIN"], {
        required_error: t("errors.roleRequired"),
    }),
    email: z.string()
        .email(t("errors.emailInvalid"))
        .max(100, t("errors.emailMax")),
    password: z.string()
            .min(6, t("errors.passwordMin"))
            .max(50, t("errors.passwordMax")),
});