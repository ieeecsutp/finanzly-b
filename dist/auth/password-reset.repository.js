"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetRepository = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const crypto_1 = __importDefault(require("crypto"));
class PasswordResetRepository {
    async createResetToken(idUsuario) {
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 1); // Token válido por 1 hora
        await prisma_1.default.passwordReset.create({
            data: {
                idUsuario,
                token,
                fechaExpiracion: expirationDate,
            },
        });
        return token;
    }
    async findResetToken(token) {
        return await prisma_1.default.passwordReset.findUnique({
            where: { token },
            include: { usuario: true },
        });
    }
    async deleteResetToken(token) {
        await prisma_1.default.passwordReset.delete({
            where: { token },
        });
    }
    async cleanupExpiredTokens() {
        await prisma_1.default.passwordReset.deleteMany({
            where: {
                fechaExpiracion: {
                    lt: new Date(),
                },
            },
        });
    }
}
exports.PasswordResetRepository = PasswordResetRepository;
