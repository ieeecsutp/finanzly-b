"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validateRequest = (customMessage = "Error de validación") => (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().flatMap(err => {
            if (err.type === "field") {
                return [{
                        field: err.path,
                        message: typeof err.msg === "string" ? err.msg : "Valor inválido"
                    }];
            }
            return [];
        });
        const response = {
            status: "error",
            message: customMessage,
            error: formattedErrors,
        };
        res.status(400).json(response);
        return;
    }
    next();
};
exports.validateRequest = validateRequest;
