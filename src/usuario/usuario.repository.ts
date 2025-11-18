import { PrismaClient, Usuario, Prisma } from "@prisma/client";
import { CrudRepository, IUserRepository } from "../interfaces/interfaces";

const prisma = new PrismaClient();

export class UsuarioRepository implements CrudRepository<Usuario>, IUserRepository{
    async getAll(): Promise<Usuario[]> {
        return await prisma.usuario.findMany();
    }

    async getById(id: number): Promise<Usuario | null> {
        return await prisma.usuario.findUnique({
            where: { idUsuario: id },
            include: { registros: false },
        });
    }

    async create(data: Prisma.UsuarioCreateInput): Promise<Usuario> {
        return await prisma.usuario.create({
            data,
        });
    }

    async getByEmail(email: string): Promise<Usuario | null> {
        return await prisma.usuario.findUnique({
            where: { correo: email },
        });
    }

    async update(id: number, data: Prisma.UsuarioUpdateInput): Promise<Usuario> {
        return await prisma.usuario.update({
            where: { idUsuario: id },
            data,
        });
    }

    async delete(id: number): Promise<Usuario> {
        return await prisma.usuario.delete({
            where: { idUsuario: id },
        });
    }

    async updatePassword(idUsuario: number, hashedPassword: string): Promise<Usuario> {
        return await prisma.usuario.update({
            where: { idUsuario },
            data: { contraseña: hashedPassword },
        });
    }
}