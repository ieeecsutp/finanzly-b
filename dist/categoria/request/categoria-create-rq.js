"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriaCreateRq = void 0;
const express_validator_1 = require("express-validator");
const categoriaCreateRq = () => [
    (0, express_validator_1.body)("nombre")
        .trim()
        .notEmpty().withMessage("El nombre es obligatorio")
        .isString().withMessage("El nombre debe ser texto")
        .isLength({ min: 3, max: 50 }).withMessage("El nombre debe tener entre 3 y 50 caracteres"),
    (0, express_validator_1.body)("tipo")
        .trim()
        .notEmpty().withMessage("El tipo es obligatorio")
        .isIn(["ingreso", "gasto", "transferencia", "ahorro"])
        .withMessage("El tipo debe ser: ingreso, gasto, transferencia o ahorro"),
];
exports.categoriaCreateRq = categoriaCreateRq;
