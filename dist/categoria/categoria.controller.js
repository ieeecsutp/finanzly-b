"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoria_service_1 = require("./categoria.service");
const categoria_create_rq_1 = require("./request/categoria-create-rq");
const categoria_update_rq_1 = require("./request/categoria-update-rq");
const validate_request_1 = require("../utils/validate-request");
const auth_1 = require("../utils/auth");
const router = (0, express_1.Router)();
const categoriaService = new categoria_service_1.CategoriaService();
// POST /categorias - Crear una nueva categoría
router.post("/", (0, categoria_create_rq_1.categoriaCreateRq)(), auth_1.verifyToken, (0, validate_request_1.validateRequest)("Datos inválidos para crear categoría"), async (req, res, next) => {
    try {
        const data = req.body;
        const newCategoria = await categoriaService.createCategoria(data);
        const response = {
            status: "success",
            message: "Categoría creada exitosamente",
            data: newCategoria,
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /categorias - Obtener todas las categorías
router.get("/", auth_1.verifyToken, async (_req, res, next) => {
    try {
        const categorias = await categoriaService.getAllCategorias();
        const response = {
            status: "success",
            message: "Categorías obtenidas correctamente",
            data: categorias,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /categorias/:id - Obtener una categoría por ID
router.get("/:id", auth_1.verifyToken, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const categoria = await categoriaService.getCategoriaById(id);
        const response = {
            status: "success",
            message: "Categoría encontrada",
            data: categoria,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /categorias/tipo/:tipo - Obtener categorías por tipo
router.get("/tipo/:tipo", auth_1.verifyToken, async (req, res, next) => {
    try {
        const tipo = req.params.tipo;
        const categorias = await categoriaService.getCategoriasByTipo(tipo);
        const response = {
            status: "success",
            message: `Categorías de tipo "${tipo}" obtenidas correctamente`,
            data: categorias,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /categorias/:id/registros - Obtener todos los registros de una categoría
router.get("/:id/registros", auth_1.verifyToken, async (req, res, next) => {
    try {
        const categoriaId = Number(req.params.id);
        const registros = await categoriaService.getRegistrosByCategoria(categoriaId);
        const response = {
            status: "success",
            message: "Registros de la categoría obtenidos correctamente",
            data: registros,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /categorias/:id/stats - Obtener estadísticas de una categoría
router.get("/:id/stats", auth_1.verifyToken, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const stats = await categoriaService.getCategoriaStats(id);
        const response = {
            status: "success",
            message: "Estadísticas de la categoría obtenidas correctamente",
            data: stats,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// PUT /categorias/:id - Actualizar una categoría existente
router.put("/:id", (0, categoria_update_rq_1.categoriaUpdateRq)(), auth_1.verifyToken, (0, validate_request_1.validateRequest)("Datos inválidos para actualizar categoría"), async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const data = req.body;
        const updatedCategoria = await categoriaService.updateCategoria(id, data);
        const response = {
            status: "success",
            message: "Categoría actualizada exitosamente",
            data: updatedCategoria,
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
});
// DELETE /categorias/:id - Eliminar una categoría
router.delete("/:id", auth_1.verifyToken, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await categoriaService.deleteCategoria(id);
        const response = {
            status: "success",
            message: "Categoría eliminada exitosamente",
            data: null,
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
