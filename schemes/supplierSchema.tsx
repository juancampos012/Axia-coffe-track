import { z } from "zod";
import { useTranslations } from "next-intl";

export const supplierSchema = (t: ReturnType<typeof useTranslations>) => z.object({
  nit: z.string()
    .min(5, t("errors.nit.min"))
    .max(20, t("errors.nit.max"))
    .regex(/^[0-9-]+$/, t("errors.nit.regex")),
  
  name: z.string()
    .min(3, t("errors.name.min"))
    .max(100, t("errors.name.max")),
  
  phone: z.string()
    .min(7, t("errors.phone.min"))
    .max(15, t("errors.phone.max"))
    .regex(/^[0-9+]+$/, t("errors.phone.regex")),
  
  address: z.string()
    .min(5, t("errors.address.min"))
    .max(200, t("errors.address.max"))
});