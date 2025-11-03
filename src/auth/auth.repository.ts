import { PrismaClient, Usuario, RefreshToken, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export class AuthRepository {
    async getByEmail(email: string): Promise<Usuario | null> {
        return await prisma.usuario.findUnique({
            where: { correo: email },
        });
    }

    async getById(id: number): Promise<Usuario | null> {
        return await prisma.usuario.findUnique({
            where: { idUsuario: id },
        });
    }

    async create(data: Prisma.UsuarioCreateInput): Promise<Usuario> {
        return await prisma.usuario.create({
            data,
        });
    }

    async createRefreshToken(
        idUsuario: number, 
        token: string, 
        fechaExpiracion: Date
    ): Promise<RefreshToken> {
        return await prisma.refreshToken.create({
            data: {
                idUsuario,
                token,
                fechaExpiracion,
            },
        });
    }

    async findRefreshToken(token: string): Promise<RefreshToken | null> {
        return await prisma.refreshToken.findUnique({
            where: { 
                token,
            },
            include: {
                usuario: true,
            },
        });
    }

    async revokeRefreshToken(token: string): Promise<void> {
        await prisma.refreshToken.update({
            where: { token },
            data: { Revocado: true },
        });
    }
}