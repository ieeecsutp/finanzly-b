"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordRq = resetPasswordRq;
const express_validator_1 = require("express-validator");
function resetPasswordRq() {
    return [
        (0, express_validator_1.body)("token")
            .notEmpty()
            .withMessage("El token es requerido")
            .isString()
            .withMessage("El token debe ser una cadena de texto"),
        (0, express_validator_1.body)("newPassword")
            .isLength({ min: 8 })
            .withMessage("La contraseña debe tener al menos 8 caracteres")
            .matches(/[A-Z]/)
            .withMessage("La contraseña debe contener al menos una mayúscula")
            .matches(/[0-9]/)
            .withMessage("La contraseña debe contener al menos un número"),
        (0, express_validator_1.body)("confirmPassword")
            .notEmpty()
            .withMessage("La confirmación de contraseña es requerida")
            .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("Las contraseñas no coinciden");
            }
            return true;
        }),
    ];
}
