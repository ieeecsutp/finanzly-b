"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userChangePwdRq = void 0;
const express_validator_1 = require("express-validator");
const userChangePwdRq = () => [
    (0, express_validator_1.body)("contraseña")
        .trim()
        .notEmpty().withMessage("La contraseña es obligatoria")
        .isLength({ min: 8, max: 50 }).withMessage("La contraseña debe tener entre 8 y 50 caracteres"),
    (0, express_validator_1.body)("pwdtoken")
        .trim()
        .notEmpty().withMessage("El token es obligatorio"),
];
exports.userChangePwdRq = userChangePwdRq;
