"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registro_service_1 = require("./registro.service");
const registro_create_rq_1 = require("./request/registro-create-rq");
const registro_update_rq_1 = require("./request/registro-update-rq");
const validate_request_1 = require("../utils/validate-request");
const auth_1 = require("../utils/auth");
const error_types_1 = require("../utils/error-types");
const router = (0, express_1.Router)();
const registroService = new registro_service_1.RegistroService();
// GET /registros/balances - Obtener balances agregados del usuario autenticado
router.get('/balances', auth_1.verifyToken, async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ status: 'error', message: 'Usuario no autenticado' });
        }
        const usuarioId = req.user.id;
        const balances = await registroService.getBalances(usuarioId);
        const response = {
            status: 'success',
            message: 'Balances obtenidos correctamente',
            data: balances,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// POST /registros - Crear un nuevo registro
router.post("/", (0, registro_create_rq_1.registroCreateRq)(), auth_1.verifyToken, (0, validate_request_1.validateRequest)("Datos inválidos para crear registro"), async (req, res, next) => {
    try {
        const data = req.body;
        const newRegistro = await registroService.createRegistro(data);
        const response = {
            status: "success",
            message: "Registro creado exitosamente",
            data: newRegistro,
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /registros - Obtener todos los registros
router.get("/", auth_1.verifyToken, async (_req, res, next) => {
    try {
        const registros = await registroService.getAllRegistros();
        const response = {
            status: "success",
            message: "Registros obtenidos correctamente",
            data: registros,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /registros/:id - Obtener un registro por ID
router.get("/:id", auth_1.verifyToken, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const registro = await registroService.getRegistroById(id);
        const response = {
            status: "success",
            message: "Registro encontrado",
            data: registro,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// POST /registros/usuario - Crear un nuevo registro
router.post("/usuario", (0, registro_create_rq_1.registroUserCreateRq)(), auth_1.verifyToken, (0, validate_request_1.validateRequest)("Datos inválidos para crear registro"), async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new error_types_1.ResourceNotFoundError("El usuario especificado no existe.");
        }
        const data = req.body;
        data.id_usuario = req.user.id;
        const newRegistro = await registroService.createRegistro(data);
        const response = {
            status: "success",
            message: "Registro creado exitosamente",
            data: newRegistro,
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /registros/usuario/:id - Obtener registros por usuario
router.get("/usuario/:id", auth_1.verifyToken, async (req, res, next) => {
    try {
        const usuarioId = Number(req.params.id);
        const registros = await registroService.getRegistrosByUsuario(usuarioId);
        const response = {
            status: "success",
            message: `Registros del usuario obtenidos correctamente`,
            data: registros,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /registros/categoria/:id - Obtener registros por categoría
router.get("/categoria/:id", auth_1.verifyToken, async (req, res, next) => {
    try {
        const categoriaId = Number(req.params.id);
        const registros = await registroService.getRegistrosByCategoria(categoriaId);
        const response = {
            status: "success",
            message: `Registros de la categoría obtenidos correctamente`,
            data: registros,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /registros/fecha - Obtener registros por rango de fechas
// Query params: startDate, endDate, usuarioId (opcional)
router.get("/fecha/rango", auth_1.verifyToken, async (req, res, next) => {
    try {
        const { startDate, endDate, usuarioId } = req.query;
        if (!startDate || !endDate) {
            const response = {
                status: "error",
                message: "Los parámetros startDate y endDate son obligatorios",
            };
            return res.status(400).json(response);
        }
        const userIdNumber = usuarioId ? Number(usuarioId) : undefined;
        const registros = await registroService.getRegistrosByDateRange(startDate, endDate, userIdNumber);
        const response = {
            status: "success",
            message: `Registros del rango de fechas obtenidos correctamente`,
            data: registros,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// PUT /registros/:id - Actualizar un registro existente
router.put("/:id", (0, registro_update_rq_1.registroUpdateRq)(), auth_1.verifyToken, (0, validate_request_1.validateRequest)("Datos inválidos para actualizar registro"), async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const data = req.body;
        const updatedRegistro = await registroService.updateRegistro(id, data);
        const response = {
            status: "success",
            message: "Registro actualizado exitosamente",
            data: updatedRegistro,
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
});
// DELETE /registros/:id - Eliminar un registro
router.delete("/:id", auth_1.verifyToken, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await registroService.deleteRegistro(id);
        const response = {
            status: "success",
            message: "Registro eliminado exitosamente",
            data: null,
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
