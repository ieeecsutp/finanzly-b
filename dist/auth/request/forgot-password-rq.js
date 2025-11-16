"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordRq = forgotPasswordRq;
const express_validator_1 = require("express-validator");
function forgotPasswordRq() {
    return [
        (0, express_validator_1.body)("correo")
            .isEmail()
            .withMessage("El correo debe ser válido")
            .trim()
            .normalizeEmail(),
    ];
}
