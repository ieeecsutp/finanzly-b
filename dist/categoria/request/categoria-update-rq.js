"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriaUpdateRq = void 0;
const express_validator_1 = require("express-validator");
const categoriaUpdateRq = () => [
    (0, express_validator_1.body)("nombre")
        .optional()
        .trim()
        .notEmpty().withMessage("El nombre no puede estar vacío")
        .isString().withMessage("El nombre debe ser texto")
        .isLength({ min: 3, max: 50 }).withMessage("El nombre debe tener entre 3 y 50 caracteres"),
    (0, express_validator_1.body)("tipo")
        .optional()
        .trim()
        .notEmpty().withMessage("El tipo no puede estar vacío")
        .isIn(["ingreso", "gasto", "transferencia", "ahorro"])
        .withMessage("El tipo debe ser: ingreso, gasto, transferencia o ahorro"),
];
exports.categoriaUpdateRq = categoriaUpdateRq;
