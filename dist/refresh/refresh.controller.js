"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../utils/auth");
const refresh_service_1 = require("./refresh.service");
const error_types_1 = require("../utils/error-types");
const router = (0, express_1.Router)();
const refreshService = new refresh_service_1.RefreshService();
// GET /history - Obtener historial de usuario
router.get("/history", auth_1.verifyToken, async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new error_types_1.ResourceNotFoundError("El usuario especificado no existe.");
        }
        const refresh = await refreshService.getActiveSessions(req.user.id);
        const response = {
            status: "success",
            message: "Historial encontrado",
            data: refresh,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
