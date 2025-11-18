"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("./auth.service");
const validate_request_1 = require("../utils/validate-request");
const auth_register_rq_1 = require("./request/auth-register-rq");
const auth_login_rq_1 = require("./request/auth-login-rq");
const forgot_password_rq_1 = require("./request/forgot-password-rq");
const reset_password_rq_1 = require("./request/reset-password-rq");
const auth_1 = require("../utils/auth");
const usuario_repository_1 = require("../usuario/usuario.repository");
const router = (0, express_1.Router)();
const usuaurioRepository = new usuario_repository_1.UsuarioRepository();
const authService = new auth_service_1.AuthService(usuaurioRepository);
router.post("/register", (0, auth_register_rq_1.authRegisterRq)(), (0, validate_request_1.validateRequest)("Datos invalidos"), async (req, res, next) => {
    try {
        const data = req.body;
        const newUsuario = await authService.createAuth(data);
        const response = {
            status: "success",
            message: "Usuaio creado exitosamente",
            data: newUsuario,
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
});
router.post("/login", (0, auth_login_rq_1.authLoginRq)(), (0, validate_request_1.validateRequest)("Datos invalidos"), async (req, res, next) => {
    try {
        const data = req.body;
        const loginData = await authService.loginAuth(data.correo, data.contraseña);
        res.cookie('refreshToken', loginData.refresh_token, auth_1.REFRESH_TOKEN_COOKIE_OPTIONS);
        const response = {
            status: "success",
            message: "Usuaio logeado exitosamente",
            data: loginData,
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
});
router.post("/refresh", async (req, res, next) => {
    try {
        // Obtener refresh token de la cookie
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                status: "error",
                message: "Refresh token no proporcionado",
            });
        }
        // Renovar tokens
        const { accessToken, newRefreshToken } = await authService.refreshAccessToken(refreshToken);
        // ✅ Actualizar cookie con nuevo refresh token (token rotation)
        res.cookie('refreshToken', newRefreshToken, auth_1.REFRESH_TOKEN_COOKIE_OPTIONS);
        const response = {
            status: "success",
            message: "Token renovado exitosamente",
            data: {
                access_token: accessToken,
                token_type: "bearer"
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
});
router.get("/test", auth_1.verifyToken, async (req, res, next) => {
    try {
        const data = {
            user: req.user
        };
        const response = {
            status: "success",
            message: "Usuario autenticado",
            data: data,
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
});
router.post("/forgot-password", (0, forgot_password_rq_1.forgotPasswordRq)(), (0, validate_request_1.validateRequest)("Datos invalidos"), async (req, res, next) => {
    try {
        const { correo } = req.body;
        const result = await authService.requestPasswordReset(correo);
        const response = {
            status: "success",
            message: result.message,
            data: result,
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
});
router.post("/reset-password", (0, reset_password_rq_1.resetPasswordRq)(), (0, validate_request_1.validateRequest)("Datos invalidos"), async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        const result = await authService.resetPassword(token, newPassword);
        const response = {
            status: "success",
            message: result.message,
            data: result,
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
