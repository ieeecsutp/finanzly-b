import { Prisma } from "@prisma/client";
import { AuthRepository } from "./auth.repository";
import { AuthLoginRs } from "./response/auth-login-rs";
import { UsuarioRs } from "./response/auth-register-rs";
import { BadRequestError, DuplicateResourceError, UnauthorizedError } from "../utils/error-types";
import { toAuthLoginRs, toUserRs } from "./mapper/auth.mapper";
import { verifyPassword, createAccessToken, getPasswordHash, createRefreshToken, getRefreshTokenExpiration } from "../utils/auth";
import { IUserRepository } from "../interfaces/interfaces";

export class AuthService {
    private async cleanupExpiredTokens() {
        try {
            await this.authRepository.cleanupExpiredTokens();
        } catch (error) {
            console.error('Error al limpiar tokens expirados:', error);
        }
    }
    private authRepository = new AuthRepository();
    constructor(private userRepository: IUserRepository) {}

    async createAuth(data: Prisma.UsuarioCreateInput): Promise<UsuarioRs> {
        const existingAuth = await this.userRepository.getByEmail(data.correo);
        if (existingAuth) {
            throw new DuplicateResourceError("El correo ya está registrado.");
        }

        // ✅ Hashear antes de guardar en la BD
        data.contraseña = getPasswordHash(data.contraseña);

        const usuario = await this.authRepository.create(data);

        return toUserRs(usuario);
    }

    async loginAuth(correo: string, contra: string): Promise<AuthLoginRs> {
        const usuario = await this.userRepository.getByEmail(correo);

        if (!usuario) {
            throw new BadRequestError("Correo o contraseña incorrectos.");
        }

        // ✅ Verificación correcta de la contraseña
        const isPasswordValid = verifyPassword(contra, usuario.contraseña);
        if (!isPasswordValid) {
            throw new BadRequestError("Correo o contraseña incorrectos.");
        }

        const tk_usuario = toUserRs(usuario);

        const accesstoken = createAccessToken(tk_usuario);

        const refreshToken = createRefreshToken();
        const refreshTokenExpiration = getRefreshTokenExpiration();

        await this.authRepository.createRefreshToken(
            usuario.idUsuario,
            refreshToken,
            refreshTokenExpiration
        );

        const auth = {
            access_token: accesstoken,
            token_type: "bearer",
            usuario: usuario,
            refresh_token: refreshToken,
        };

        return toAuthLoginRs(auth);
    }

    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; newRefreshToken: string }> {
        // Limpiar tokens expirados y revocados periódicamente
        await this.cleanupExpiredTokens();

        // Buscar refresh token en la base de datos
        const storedToken = await this.authRepository.findRefreshToken(refreshToken);

        if (!storedToken) {
            throw new UnauthorizedError("El refresh token proporcionado no existe en la base de datos.");
        }

        // Verificar si el token fue revocado
        if (storedToken.Revocado) {
            throw new UnauthorizedError("El refresh token ha sido revocado. Por favor inicie sesión nuevamente.");
        }

        // Verificar si el token expiró
        if (storedToken.fechaExpiracion < new Date()) {
            // Eliminar token expirado
            await this.authRepository.revokeRefreshToken(refreshToken);
            throw new UnauthorizedError("El refresh token ha expirado. Por favor inicie sesión nuevamente.");
        }

        // Verificar la antigüedad del token (detectar posible reuso)
        const tokenAge = Date.now() - storedToken.fechaCreacion.getTime();
        const maxTokenAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        
        if (tokenAge > maxTokenAge) {
            await this.authRepository.revokeRefreshToken(refreshToken);
            throw new UnauthorizedError("El refresh token es demasiado antiguo. Por favor inicie sesión nuevamente.");
        }

        // ✅ Token rotation: eliminar el token usado
        await this.authRepository.revokeRefreshToken(refreshToken);

        // Obtener datos del usuario
        const usuario = await this.authRepository.getById(storedToken.idUsuario);

        if (!usuario) {
            throw new BadRequestError("No se encontró el usuario asociado al token. Por favor inicie sesión nuevamente.");
        }

        const tk_usuario = toUserRs(usuario);

        // ✅ Generar nuevo access token
        const newAccessToken = createAccessToken(tk_usuario);

        // ✅ Generar nuevo refresh token (token rotation)
        const newRefreshToken = createRefreshToken();
        const newRefreshTokenExpiration = getRefreshTokenExpiration();

        // Guardar nuevo refresh token
        await this.authRepository.createRefreshToken(
            usuario.idUsuario,
            newRefreshToken,
            newRefreshTokenExpiration
        );

        return {
            accessToken: newAccessToken,
            newRefreshToken
        };
    }
}
