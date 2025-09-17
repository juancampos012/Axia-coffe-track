import { z } from "zod";
import { useTranslations } from "next-intl";

export const registerScheme = (t: ReturnType<typeof useTranslations>) => z.object({
	name: z.string()
			.nonempty({ message: t("errors.nameRequired") })
            .min(4, {message: t("errors.nameMin")})
            .max(40)
			.refine(
				(value) => /^[a-zA-Z]+$/.test(value ?? ""),
				{ message: t("errors.nameFormat") }
			  ),
		
	email: z.string()
			.nonempty({ message: t("errors.emailRequired") })
			.email({message: t("errors.emailInvalid") })
			.max(40),

	password: z.string()
				.nonempty({ message: t("errors.passwordRequired") })
				.min(8, {message: t("errors.passwordMin") })
			    .max(20)
				.refine(
					(value) => /^[a-zA-Z0-9]+$/.test(value ?? ""), 
					{ message: t("errors.passwordFormat") }
				),
 
/* 	confirmPassword: z.string()
						.min(8, {message: "Confirm password is required"})
						.max(20), */

})