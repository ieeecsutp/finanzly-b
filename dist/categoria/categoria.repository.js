"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CategoriaRepository {
    async getAll() {
        return await prisma.categoria.findMany({
            include: {
                registros: true,
            },
        });
    }
    async getById(id) {
        return await prisma.categoria.findUnique({
            where: { idCategoria: id },
            include: {
                registros: true,
            },
        });
    }
    async getByTipo(tipo) {
        return await prisma.categoria.findMany({
            where: { tipo: tipo },
            include: {
                registros: true,
            },
            orderBy: { nombre: 'asc' },
        });
    }
    async getByNombre(nombre) {
        return await prisma.categoria.findFirst({
            where: {
                nombre: {
                    equals: nombre,
                    mode: 'insensitive' // Case insensitive
                }
            },
        });
    }
    async getByNombreAndTipo(nombre, tipo) {
        return await prisma.categoria.findFirst({
            where: {
                nombre: {
                    equals: nombre,
                    mode: 'insensitive'
                },
                tipo: tipo
            },
        });
    }
    async getByNombreAndTipoExcludingId(nombre, tipo, excludeId) {
        return await prisma.categoria.findFirst({
            where: {
                nombre: {
                    equals: nombre,
                    mode: 'insensitive'
                },
                tipo: tipo,
                NOT: {
                    idCategoria: excludeId
                }
            },
        });
    }
    async create(data) {
        return await prisma.categoria.create({
            data,
            include: {
                registros: true,
            },
        });
    }
    async update(id, data) {
        return await prisma.categoria.update({
            where: { idCategoria: id },
            data,
            include: {
                registros: true,
            },
        });
    }
    async delete(id) {
        return await prisma.categoria.delete({
            where: { idCategoria: id },
        });
    }
    async hasRegistros(categoriaId) {
        const count = await prisma.registro.count({
            where: { idCategoria: categoriaId },
        });
        return count > 0;
    }
    async getRegistrosByCategoriaId(categoriaId) {
        return await prisma.registro.findMany({
            where: { idCategoria: categoriaId },
            include: {
                usuario: true,
                categoria: true,
            },
            orderBy: { fechaRegistro: 'desc' },
        });
    }
    async getCategoriaStats(categoriaId) {
        const stats = await prisma.registro.aggregate({
            where: { idCategoria: categoriaId },
            _count: {
                idRegistro: true,
            },
            _sum: {
                monto: true,
            },
        });
        return {
            totalRegistros: stats._count.idRegistro,
            montoTotal: stats._sum.monto ? parseFloat(stats._sum.monto.toString()) : 0,
        };
    }
}
exports.CategoriaRepository = CategoriaRepository;
