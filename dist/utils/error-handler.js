"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const error_types_1 = require("./error-types");
function errorHandler(err, _req, res, _next) {
    if (err instanceof error_types_1.BaseError) {
        return res.status(err.statusCode).json({
            status: "error",
            message: err.message,
        });
    }
    console.error("[ERROR] Error interno del servidor:", err);
    res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
    });
}
