"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const auth_repository_1 = require("./auth.repository");
const password_reset_repository_1 = require("./password-reset.repository");
const error_types_1 = require("../utils/error-types");
const auth_mapper_1 = require("./mapper/auth.mapper");
const auth_1 = require("../utils/auth");
const mailer_1 = require("../lib/mailer");
class AuthService {
    userRepository;
    async cleanupExpiredTokens() {
        try {
            await this.authRepository.cleanupExpiredTokens();
        }
        catch (error) {
            console.error('Error al limpiar tokens expirados:', error);
        }
    }
    authRepository = new auth_repository_1.AuthRepository();
    passwordResetRepository = new password_reset_repository_1.PasswordResetRepository();
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async createAuth(data) {
        const existingAuth = await this.userRepository.getByEmail(data.correo);
        if (existingAuth) {
            throw new error_types_1.DuplicateResourceError("El correo ya está registrado.");
        }
        // ✅ Hashear antes de guardar en la BD
        data.contraseña = (0, auth_1.getPasswordHash)(data.contraseña);
        const usuario = await this.authRepository.create(data);
        return (0, auth_mapper_1.toUserRs)(usuario);
    }
    async loginAuth(correo, contra) {
        const usuario = await this.userRepository.getByEmail(correo);
        if (!usuario) {
            throw new error_types_1.BadRequestError("Correo o contraseña incorrectos.");
        }
        // ✅ Verificación correcta de la contraseña
        const isPasswordValid = (0, auth_1.verifyPassword)(contra, usuario.contraseña);
        if (!isPasswordValid) {
            throw new error_types_1.BadRequestError("Correo o contraseña incorrectos.");
        }
        const tk_usuario = (0, auth_mapper_1.toUserRs)(usuario);
        const accesstoken = (0, auth_1.createAccessToken)(tk_usuario);
        const refreshToken = (0, auth_1.createRefreshToken)();
        const refreshTokenExpiration = (0, auth_1.getRefreshTokenExpiration)();
        await this.authRepository.createRefreshToken(usuario.idUsuario, refreshToken, refreshTokenExpiration);
        const auth = {
            access_token: accesstoken,
            token_type: "bearer",
            usuario: usuario,
            refresh_token: refreshToken,
        };
        return (0, auth_mapper_1.toAuthLoginRs)(auth);
    }
    async refreshAccessToken(refreshToken) {
        // Limpiar tokens expirados y revocados periódicamente
        await this.cleanupExpiredTokens();
        // Buscar refresh token en la base de datos
        const storedToken = await this.authRepository.findRefreshToken(refreshToken);
        if (!storedToken) {
            throw new error_types_1.UnauthorizedError("El refresh token proporcionado no existe en la base de datos.");
        }
        // Verificar si el token fue revocado
        if (storedToken.Revocado) {
            throw new error_types_1.UnauthorizedError("El refresh token ha sido revocado. Por favor inicie sesión nuevamente.");
        }
        // Verificar si el token expiró
        if (storedToken.fechaExpiracion < new Date()) {
            // Eliminar token expirado
            await this.authRepository.revokeRefreshToken(refreshToken);
            throw new error_types_1.UnauthorizedError("El refresh token ha expirado. Por favor inicie sesión nuevamente.");
        }
        // Verificar la antigüedad del token (detectar posible reuso)
        const tokenAge = Date.now() - storedToken.fechaCreacion.getTime();
        const maxTokenAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        if (tokenAge > maxTokenAge) {
            await this.authRepository.revokeRefreshToken(refreshToken);
            throw new error_types_1.UnauthorizedError("El refresh token es demasiado antiguo. Por favor inicie sesión nuevamente.");
        }
        // ✅ Token rotation: eliminar el token usado
        await this.authRepository.revokeRefreshToken(refreshToken);
        // Obtener datos del usuario
        const usuario = await this.authRepository.getById(storedToken.idUsuario);
        if (!usuario) {
            throw new error_types_1.BadRequestError("No se encontró el usuario asociado al token. Por favor inicie sesión nuevamente.");
        }
        const tk_usuario = (0, auth_mapper_1.toUserRs)(usuario);
        // ✅ Generar nuevo access token
        const newAccessToken = (0, auth_1.createAccessToken)(tk_usuario);
        // ✅ Generar nuevo refresh token (token rotation)
        const newRefreshToken = (0, auth_1.createRefreshToken)();
        const newRefreshTokenExpiration = (0, auth_1.getRefreshTokenExpiration)();
        // Guardar nuevo refresh token
        await this.authRepository.createRefreshToken(usuario.idUsuario, newRefreshToken, newRefreshTokenExpiration);
        return {
            accessToken: newAccessToken,
            newRefreshToken
        };
    }
    async requestPasswordReset(correo) {
        const usuario = await this.userRepository.getByEmail(correo);
        if (!usuario) {
            throw new error_types_1.BadRequestError("El correo proporcionado no existe en el sistema.");
        }
        // Limpiar tokens expirados
        await this.passwordResetRepository.cleanupExpiredTokens();
        // Crear token de recuperación
        const resetToken = await this.passwordResetRepository.createResetToken(usuario.idUsuario);
        // Generar URL de reset para enviar por email
        const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const resetUrl = `${frontendUrl.replace(/\/+$/, "")}/reset-password?token=${resetToken}`;
        // Intentar enviar email con SendGrid (si está configurado)
        const mailResult = await (0, mailer_1.sendResetEmail)(correo, resetUrl, resetToken);
        // En entorno de desarrollo o si el envío falla, retornamos token y resetUrl para facilitar pruebas
        const isProd = (process.env.NODE_ENV === "production");
        const response = {
            message: `Si la cuenta existe, se ha enviado un enlace de recuperación al correo ${correo}. Revisa tu bandeja de entrada (y spam).`,
        };
        if (!isProd) {
            // Mostrar token y resetUrl en dev para pruebas rápidas
            response.token = resetToken;
            response.resetUrl = resetUrl;
        }
        else if (!mailResult.success) {
            // En producción si el mail no pudo enviarse, devolver mensaje y log
            response.resetUrl = resetUrl; // opcional para soporte
        }
        return response;
    }
    async resetPassword(token, newPassword) {
        // Limpiar tokens expirados
        await this.passwordResetRepository.cleanupExpiredTokens();
        // Buscar el token
        const resetTokenData = await this.passwordResetRepository.findResetToken(token);
        if (!resetTokenData) {
            throw new error_types_1.BadRequestError("El token de recuperación es inválido o ha expirado.");
        }
        // Verificar si el token expiró
        if (resetTokenData.fechaExpiracion < new Date()) {
            await this.passwordResetRepository.deleteResetToken(token);
            throw new error_types_1.UnauthorizedError("El token de recuperación ha expirado. Por favor, solicita uno nuevo.");
        }
        // Actualizar contraseña del usuario
        const hashedPassword = (0, auth_1.getPasswordHash)(newPassword);
        await this.userRepository.updatePassword(resetTokenData.idUsuario, hashedPassword);
        // Eliminar el token usado
        await this.passwordResetRepository.deleteResetToken(token);
        return {
            message: "Contraseña actualizada exitosamente. Por favor, inicia sesión con tu nueva contraseña."
        };
    }
}
exports.AuthService = AuthService;
