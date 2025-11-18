"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class UsuarioRepository {
    async getAll() {
        return await prisma.usuario.findMany();
    }
    async getById(id) {
        return await prisma.usuario.findUnique({
            where: { idUsuario: id },
            include: { registros: false },
        });
    }
    async create(data) {
        return await prisma.usuario.create({
            data,
        });
    }
    async getByEmail(email) {
        return await prisma.usuario.findUnique({
            where: { correo: email },
        });
    }
    async update(id, data) {
        return await prisma.usuario.update({
            where: { idUsuario: id },
            data,
        });
    }
    async delete(id) {
        return await prisma.usuario.delete({
            where: { idUsuario: id },
        });
    }
    async updatePassword(idUsuario, hashedPassword) {
        return await prisma.usuario.update({
            where: { idUsuario },
            data: { contraseña: hashedPassword },
        });
    }
}
exports.UsuarioRepository = UsuarioRepository;
