import { z } from "zod";
import { useTranslations } from "next-intl";

export const loginScheme = (t: ReturnType<typeof useTranslations>) => z.object({
	email: z.string()
			.nonempty({ message: t("errors.emailRequired") })
			.email(t("errors.emailInvalid"))
			.toLowerCase()
        	.max(40),
		
	password: z.string()
				.nonempty({ message: t("errors.passwordRequired") })
				.min(1, t("errors.passwordRequired")),
});