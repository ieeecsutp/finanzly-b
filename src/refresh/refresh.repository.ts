import { PrismaClient, RefreshToken, Prisma } from "@prisma/client";
import { IRefreshRepository } from "../interfaces/interfaces";

const prisma = new PrismaClient();

export class RefreshRepository implements IRefreshRepository{
    async getActiveSessions(id: number): Promise<RefreshToken[]> {
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