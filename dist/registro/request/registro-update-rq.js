"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registroUpdateRq = void 0;
const express_validator_1 = require("express-validator");
const registroUpdateRq = () => [
    (0, express_validator_1.body)("id_usuario")
        .optional()
        .isInt({ min: 1 }).withMessage("El ID del usuario debe ser un número entero positivo"),
    (0, express_validator_1.body)("id_categoria")
        .optional()
        .isInt({ min: 1 }).withMessage("El ID de la categoría debe ser un número entero positivo"),
    (0, express_validator_1.body)("tipo")
        .optional()
        .trim()
        .notEmpty().withMessage("El tipo no puede estar vacío")
        .isIn(["ingreso", "gasto", "transferencia", "ahorro"])
        .withMessage("El tipo debe ser: ingreso, gasto, transferencia o ahorro"),
    (0, express_validator_1.body)("descripcion")
        .optional()
        .trim()
        .notEmpty().withMessage("La descripción no puede estar vacía")
        .isString().withMessage("La descripción debe ser texto")
        .isLength({ min: 3, max: 500 }).withMessage("La descripción debe tener entre 3 y 500 caracteres (aprox. 100 palabras)"),
    (0, express_validator_1.body)("monto")
        .optional()
        .isNumeric().withMessage("El monto debe ser un número válido"),
    (0, express_validator_1.body)("fecha_registro")
        .optional()
        .isISO8601().withMessage("La fecha de registro debe tener un formato válido (ISO 8601)")
];
exports.registroUpdateRq = registroUpdateRq;
