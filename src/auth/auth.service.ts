import { Prisma } from "@prisma/client";
import { AuthRepository } from "./auth.repository";
import { AuthLoginRs } from "./response/auth-login-rs";
import { UsuarioRs } from "./response/auth-register-rs";
import { BadRequestError, DuplicateResourceError, UnauthorizedError } from "../utils/error-types";
import { toAuthLoginRs, toUserRs } from "./mapper/auth.mapper";
import { verifyPassword, createAccessToken, getPasswordHash, createRefreshToken, getRefreshTokenExpiration } from "../utils/auth";

export class AuthService {
    private authRepository = new AuthRepository();

    async createAuth(data: Prisma.UsuarioCreateInput): Promise<UsuarioRs> {
        const existingAuth = await this.authRepository.getByEmail(data.correo);
        if (existingAuth) {
            throw new DuplicateResourceError("El correo ya está registrado.");
        }

        // ✅ Hashear antes de guardar en la BD
        data.contraseña = getPasswordHash(data.contraseña);

        const usuario = await this.authRepository.create(data);

        return toUserRs(usuario);
    }

    async loginAuth(correo: string, contra: string): Promise<AuthLoginRs> {
        const usuario = await this.authRepository.getByEmail(correo);

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
        // Buscar refresh token en la base de datos
        const storedToken = await this.authRepository.findRefreshToken(refreshToken);

        if (!storedToken) {
            throw new UnauthorizedError("Refresh token inválido.");
        }

        // Verificar si el token fue revocado
        if (storedToken.Revocado) {
            throw new UnauthorizedError("Refresh token revocado.");
        }

        // Verificar si el token expiró
        if (storedToken.fechaExpiracion < new Date()) {
            // Eliminar token expirado
            await this.authRepository.revokeRefreshToken(refreshToken);
            throw new UnauthorizedError("Refresh token expirado.");
        }

        // ✅ Token rotation: eliminar el token usado
        await this.authRepository.revokeRefreshToken(refreshToken);

        // Obtener datos del usuario
        const usuario = await this.authRepository.getById(storedToken.idUsuario);

        if (!usuario) {
            throw new BadRequestError("Usuario no encontrado.");
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
