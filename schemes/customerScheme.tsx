import { z } from "zod";

// Campos de la finca y fecha de nacimiento, compartidos por creación y edición
export const customerFarmFields = {
    birthDate: z
      .string()
      .nonempty("La fecha de nacimiento es obligatoria")
      .refine(
        (value) => !isNaN(Date.parse(value)) && new Date(value) <= new Date(),
        { message: "La fecha de nacimiento no es válida" }
      ),

    farmName: z
      .string()
      .trim()
      .nonempty("El nombre de la finca es obligatorio")
      .max(80, "El nombre de la finca no puede superar 80 caracteres"),

    farmVereda: z
      .string()
      .trim()
      .nonempty("La vereda es obligatoria")
      .max(80, "La vereda no puede superar 80 caracteres"),

    farmTotalHectares: z.coerce
      .number({ invalid_type_error: "Ingrese un número válido" })
      .positive("Las hectáreas totales deben ser mayores a 0"),

    farmCoffeeHectares: z.coerce
      .number({ invalid_type_error: "Ingrese un número válido" })
      .positive("Las hectáreas en café deben ser mayores a 0"),

    coffeeTrees: z.coerce
      .number({ invalid_type_error: "Ingrese un número válido" })
      .int("El número de árboles debe ser un número entero")
      .positive("El número de árboles debe ser mayor a 0"),
};

type FarmHectares = { farmTotalHectares: number; farmCoffeeHectares: number };

export const isCoffeeHectaresValid = (data: FarmHectares) =>
  data.farmCoffeeHectares <= data.farmTotalHectares;

export const coffeeHectaresError = {
  message: "Las hectáreas en café no pueden superar las hectáreas totales",
  path: ["farmCoffeeHectares"],
};

export const customertSchema = () =>
  z.object({
    identification: z
      .string()
      .nonempty("La identificación es obligatoria"),

    firstName: z
      .string()
      .nonempty("El primer nombre es obligatorio")
      .min(3, "El primer nombre debe tener al menos 3 caracteres")
      .max(40, "El primer nombre no puede superar 40 caracteres")
      .refine(
        (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value),
        { message: "El primer nombre solo puede contener letras" }
      ),

    middleName: z
      .string()
      .max(40, "El segundo nombre no puede superar 40 caracteres")
      .refine(
        (value) => !value || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value),
        { message: "El segundo nombre solo puede contener letras" }
      )
      .optional()
      .or(z.literal("")),

    lastName: z
      .string()
      .nonempty("El apellido es obligatorio")
      .min(3, "El apellido debe tener al menos 3 caracteres")
      .max(40, "El apellido no puede superar 40 caracteres")
      .refine(
        (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value),
        { message: "El apellido solo puede contener letras" }
      ),

    secondLastName: z
      .string()
      .max(40, "El segundo apellido no puede superar 40 caracteres")
      .refine(
        (value) => !value || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value),
        { message: "El segundo apellido solo puede contener letras" }
      )
      .optional()
      .or(z.literal("")),

    phone: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (value) => !value || /^[0-9]{10}$/.test(value),
        { message: "El teléfono debe tener exactamente 10 dígitos" }
      ),

    ...customerFarmFields,
  }).refine(isCoffeeHectaresValid, coffeeHectaresError);
