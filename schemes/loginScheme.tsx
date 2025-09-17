import { z } from "zod";
import { useTranslations } from "next-intl";

export const loginScheme = (t: ReturnType<typeof useTranslations>) => z.object({
	email: z.string()
			.nonempty({ message: t("errors.emailRequired") })
			.email(t("errors.emailInvalid"))
        	.max(40),
		
	password: z.string()
				.nonempty({ message: t("errors.passwordRequired") })
				.min(7, t("errors.passwordMin"))
				.max(20)
				.refine((value) => /^[a-zA-Z0-9]+/.test(value ?? ""), {
					message: t("errors.passwordFormat"),
				}),
});