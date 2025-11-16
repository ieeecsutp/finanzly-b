"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AuthRepository {
    async cleanupExpiredTokens() {
        const now = new Date();
        await prisma.refreshToken.deleteMany({
            where: {
                OR: [
                    { fechaExpiracion: { lt: now } },
                    { Revocado: true }
                ]
            }
        });
    }
    async getById(id) {
        return await prisma.usuario.findUnique({
            where: { idUsuario: id },
        });
    }
    async create(data) {
        return await prisma.usuario.create({
            data,
        });
    }
    async createRefreshToken(idUsuario, token, fechaExpiracion) {
        return await prisma.refreshToken.create({
            data: {
                idUsuario,
                token,
                fechaExpiracion,
            },
        });
    }
    async findRefreshToken(token) {
        return await prisma.refreshToken.findUnique({
            where: {
                token,
            },
            include: {
                usuario: true,
            },
        });
    }
    async revokeRefreshToken(token) {
        await prisma.refreshToken.update({
            where: { token },
            data: { Revocado: true },
        });
    }
}
exports.AuthRepository = AuthRepository;
