import { z } from "zod";

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

    email: z
      .string()
      .nonempty("El correo es obligatorio")
      .email("Correo inválido")
      .max(40, "El correo no puede superar 40 caracteres"),
  });