"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLoginRq = void 0;
const express_validator_1 = require("express-validator");
const authLoginRq = () => [
    (0, express_validator_1.body)("correo")
        .trim()
        .notEmpty().withMessage("El correo es obligatorio")
        .normalizeEmail(),
    (0, express_validator_1.body)("contraseña")
        .trim()
        .notEmpty().withMessage("La contraseña es obligatoria")
];
exports.authLoginRq = authLoginRq;
