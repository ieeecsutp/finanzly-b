"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RefreshRepository {
    async getActiveSessions(id) {
        return await prisma.refreshToken.findMany({
            where: {
                idUsuario: id,
                Revocado: false,
                fechaExpiracion: {
                    gt: new Date()
                }
            },
        });
    }
}
exports.RefreshRepository = RefreshRepository;
