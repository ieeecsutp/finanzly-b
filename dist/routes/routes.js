"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../auth/auth.controller"));
const usuario_controller_1 = __importDefault(require("../usuario/usuario.controller"));
const registro_controller_1 = __importDefault(require("../registro/registro.controller"));
const categoria_controller_1 = __importDefault(require("../categoria/categoria.controller"));
const refresh_controller_1 = __importDefault(require("../refresh/refresh.controller"));
const router = (0, express_1.Router)();
router.use("/auth", auth_controller_1.default);
router.use("/usuarios", usuario_controller_1.default);
router.use("/registros", registro_controller_1.default);
router.use("/categorias", categoria_controller_1.default);
router.use("/refresh", refresh_controller_1.default);
exports.default = router;
