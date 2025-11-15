import { body } from "express-validator";

export const userChangePwdRq = () => [
    body("contraseña")
        .trim()
        .notEmpty().withMessage("La contraseña es obligatoria")
        .isLength({ min: 8, max: 50 }).withMessage("La contraseña debe tener entre 8 y 50 caracteres"),
    
    body("pwdtoken")
        .trim()
        .notEmpty().withMessage("El token es obligatorio"),
]