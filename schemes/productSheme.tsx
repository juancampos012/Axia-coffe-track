import { z } from "zod";
import { useTranslations } from "next-intl";

export const productSchema = (t: ReturnType<typeof useTranslations>) => z.object({
  name: z.string()
    .nonempty(t("errors.name.required")),
  
  stock: z.number({invalid_type_error: t("errors.stock.number"),})
    .min(1, t("errors.stock.min")),
  
  tax: z.number({ invalid_type_error: t("errors.tax.number"),})
    .min(0, t("errors.tax.min"))
    .max(100, t("errors.tax.max")),
  
  purchasePrice: z.number({invalid_type_error: t("errors.purchasePrice.number"),})
    .min(1, t("errors.purchasePrice.min")),
  
  salePrice: z.number({invalid_type_error: t("errors.salePrice.number"),})
    .min(1, t("errors.salePrice.min")),
});