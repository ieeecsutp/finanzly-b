import { body } from "express-validator";

export const authLoginRq = () => [
    body("correo")
        .trim()
        .notEmpty().withMessage("El correo es obligatorio")
        .normalizeEmail(),

    body("contraseña")
        .trim()
        .notEmpty().withMessage("La contraseña es obligatoria")
]