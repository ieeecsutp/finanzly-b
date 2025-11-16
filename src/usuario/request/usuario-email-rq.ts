import { body } from "express-validator";

export const userEmailRq = () => [
    body("correo")
        .trim()
        .notEmpty().withMessage("El correo es obligatorio")
        .isEmail().withMessage("Debe ser un correo válido")
]