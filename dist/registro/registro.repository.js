"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistroRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RegistroRepository {
    async getAll() {
        return await prisma.registro.findMany({
            include: {
                usuario: true,
                categoria: true,
            },
        });
    }
    async getById(id) {
        return await prisma.registro.findUnique({
            where: { idRegistro: id },
            include: {
                usuario: true,
                categoria: true,
            },
        });
    }
    async getByUsuarioId(usuarioId) {
        return await prisma.registro.findMany({
            where: { idUsuario: usuarioId },
            include: {
                usuario: true,
                categoria: true,
            },
            orderBy: { fechaRegistro: 'desc' },
        });
    }
    async getByCategoriaId(categoriaId) {
        return await prisma.registro.findMany({
            where: { idCategoria: categoriaId },
            include: {
                usuario: true,
                categoria: true,
            },
            orderBy: { fechaRegistro: 'desc' },
        });
    }
    async getByDateRange(startDate, endDate, usuarioId) {
        const whereCondition = {
            fechaRegistro: {
                gte: startDate,
                lte: endDate,
            },
        };
        if (usuarioId) {
            whereCondition.idUsuario = usuarioId;
        }
        return await prisma.registro.findMany({
            where: whereCondition,
            include: {
                usuario: true,
                categoria: true,
            },
            orderBy: { fechaRegistro: 'desc' },
        });
    }
    async create(data) {
        return await prisma.registro.create({
            data,
            include: {
                usuario: true,
                categoria: true,
            },
        });
    }
    async update(id, data) {
        return await prisma.registro.update({
            where: { idRegistro: id },
            data,
            include: {
                usuario: true,
                categoria: true,
            },
        });
    }
    async delete(id) {
        return await prisma.registro.delete({
            where: { idRegistro: id },
        });
    }
    async checkUsuarioExists(usuarioId) {
        const usuario = await prisma.usuario.findUnique({
            where: { idUsuario: usuarioId },
        });
        return !!usuario;
    }
    async checkCategoriaExists(categoriaId) {
        const categoria = await prisma.categoria.findUnique({
            where: { idCategoria: categoriaId },
        });
        return !!categoria;
    }
    // Devuelve la suma total de montos por tipo ('ingreso'|'gasto') para un usuario
    async sumMontoByUserAndTipo(usuarioId, tipo) {
        const result = await prisma.registro.aggregate({
            where: {
                idUsuario: usuarioId,
                tipo: tipo,
            },
            _sum: {
                monto: true,
            },
        });
        // Prisma devuelve Decimal o null
        // @ts-ignore
        return result._sum?.monto ? Number(result._sum.monto) : 0;
    }
    // Devuelve la suma de montos por tipo en un rango de fechas (inclusive) para un usuario
    async sumMontoByUserTipoAndDateRange(usuarioId, tipo, start, end) {
        const result = await prisma.registro.aggregate({
            where: {
                idUsuario: usuarioId,
                tipo: tipo,
                fechaRegistro: {
                    gte: start,
                    lte: end,
                },
            },
            _sum: {
                monto: true,
            },
        });
        // @ts-ignore
        return result._sum?.monto ? Number(result._sum.monto) : 0;
    }
}
exports.RegistroRepository = RegistroRepository;
