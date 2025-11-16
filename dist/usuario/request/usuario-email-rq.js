"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userEmailRq = void 0;
const express_validator_1 = require("express-validator");
const userEmailRq = () => [
    (0, express_validator_1.body)("correo")
        .trim()
        .notEmpty().withMessage("El correo es obligatorio")
        .isEmail().withMessage("Debe ser un correo válido")
];
exports.userEmailRq = userEmailRq;
