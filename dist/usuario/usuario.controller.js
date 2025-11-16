"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuario_service_1 = require("./usuario.service");
const usuario_create_rq_1 = require("./request/usuario-create-rq");
const validate_request_1 = require("../utils/validate-request");
const auth_1 = require("../utils/auth");
const router = (0, express_1.Router)();
const usuarioService = new usuario_service_1.UsuarioService();
// POST /usuario - Crear un nuevo usuario
router.post("/", (0, usuario_create_rq_1.userCreateRq)(), auth_1.verifyToken, (0, validate_request_1.validateRequest)("Datos invalidos"), async (req, res, next) => {
    try {
        const data = req.body;
        const newUsuario = await usuarioService.createUsuario(data);
        const response = {
            status: "success",
            message: "Usuario creado exitosamente",
            data: newUsuario,
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /usuario - Obtener todos los usuarios
router.get("/", auth_1.verifyToken, async (_req, res, next) => {
    try {
        const usuarios = await usuarioService.getAllUsuarios();
        const response = {
            status: "success",
            message: "Usuarios obtenidos correctamente",
            data: usuarios,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// GET /usuario/:id - Obtener un usuario por ID
router.get("/:id", auth_1.verifyToken, auth_1.verifyUserMatch, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const usuario = await usuarioService.getUsuarioById(id);
        const response = {
            status: "success",
            message: "Usuario encontrado",
            data: usuario,
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// PUT /usuario/:id - Actualizar un usuario existente
router.put("/:id", (0, usuario_create_rq_1.userCreateRq)(), // Puedes usar la misma validación o crear una específica para update
auth_1.verifyToken, auth_1.verifyUserMatch, (0, validate_request_1.validateRequest)("Datos invalidos"), async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const data = req.body;
        const updatedUsuario = await usuarioService.updateUsuario(id, data);
        const response = {
            status: "success",
            message: "Usuario actualizado exitosamente",
            data: updatedUsuario,
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
});
// DELETE /usuario/:id - Eliminar un usuario
router.delete("/:id", auth_1.verifyToken, auth_1.verifyUserMatch, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await usuarioService.deleteUsuario(id);
        const response = {
            status: "success",
            message: "Usuario eliminado exitosamente",
            data: null,
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//POST - Crear usuario
//GET - Obtener todos los usuarios
//GET /:id - Obtener usuario por ID
//PUT /:id - Actualizar usuario
//DELETE /:id - Eliminar usuario
