"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCreateRq = void 0;
const express_validator_1 = require("express-validator");
const userCreateRq = () => [
    (0, express_validator_1.body)("nombre")
        .trim()
        .notEmpty().withMessage("El nombre es obligatorio")
        .isString().withMessage("El nombre debe ser texto")
        .isLength({ min: 3 }).withMessage("El nombre debe tener al menos 3 caracteres"),
    (0, express_validator_1.body)("correo")
        .trim()
        .notEmpty().withMessage("El correo es obligatorio")
        .isEmail().withMessage("Debe ser un correo válido"),
    (0, express_validator_1.body)("contraseña")
        .trim()
        .notEmpty().withMessage("La contraseña es obligatoria")
        .isLength({ min: 8, max: 50 }).withMessage("La contraseña debe tener entre 8 y 50 caracteres")
];
exports.userCreateRq = userCreateRq;
