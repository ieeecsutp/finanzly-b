"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistroService = void 0;
const registro_repository_1 = require("./registro.repository");
const error_types_1 = require("../utils/error-types");
const registro_mapper_1 = require("./mapper/registro.mapper");
const date_1 = require("../utils/date");
class RegistroService {
    registroRepository = new registro_repository_1.RegistroRepository();
    /**
     * Obtener balances agregados para un usuario
     * - balance_total: ingresos - gastos (todos los registros)
     * - ingresos_mensuales/gastos_mensuales: para el mes actual
     */
    async getBalances(usuarioId) {
        // calcular totales globales
        const totalIngresos = await this.registroRepository.sumMontoByUserAndTipo(usuarioId, 'ingreso');
        const totalGastos = await this.registroRepository.sumMontoByUserAndTipo(usuarioId, 'gasto');
        // calcular rango del mes actual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const ingresosMensuales = await this.registroRepository.sumMontoByUserTipoAndDateRange(usuarioId, 'ingreso', startOfMonth, endOfMonth);
        const gastosMensuales = await this.registroRepository.sumMontoByUserTipoAndDateRange(usuarioId, 'gasto', startOfMonth, endOfMonth);
        return {
            balance_total: Number((totalIngresos || 0) - (totalGastos || 0)),
            ingresos_mensuales: Number(ingresosMensuales || 0),
            gastos_mensuales: Number(gastosMensuales || 0),
        };
    }
    async createRegistro(data) {
        // Verificar que el usuario existe
        const usuarioExists = await this.registroRepository.checkUsuarioExists(data.id_usuario);
        if (!usuarioExists) {
            throw new error_types_1.ResourceNotFoundError("El usuario especificado no existe.");
        }
        // Verificar que la categoría existe
        const categoriaExists = await this.registroRepository.checkCategoriaExists(data.id_categoria);
        if (!categoriaExists) {
            throw new error_types_1.ResourceNotFoundError("La categoría especificada no existe.");
        }
        const registroData = {
            tipo: data.tipo,
            descripcion: data.descripcion,
            monto: data.monto,
            fechaRegistro: (0, date_1.parseDateToDateTime)(data.fecha_registro),
            fechaCreacion: new Date(),
            usuario: {
                connect: { idUsuario: data.id_usuario }
            },
            categoria: {
                connect: { idCategoria: data.id_categoria }
            }
        };
        const registro = await this.registroRepository.create(registroData);
        return (0, registro_mapper_1.toRegistroDetailRs)(registro);
    }
    async getAllRegistros() {
        const registros = await this.registroRepository.getAll();
        return (0, registro_mapper_1.toRegistrosItemRsList)(registros);
    }
    async getRegistroById(id) {
        const registro = await this.registroRepository.getById(id);
        if (!registro) {
            throw new error_types_1.ResourceNotFoundError("Registro no encontrado.");
        }
        return (0, registro_mapper_1.toRegistroDetailRs)(registro);
    }
    async getRegistrosByUsuario(usuarioId) {
        // Verificar que el usuario existe
        const usuarioExists = await this.registroRepository.checkUsuarioExists(usuarioId);
        if (!usuarioExists) {
            throw new error_types_1.ResourceNotFoundError("El usuario especificado no existe.");
        }
        const registros = await this.registroRepository.getByUsuarioId(usuarioId);
        return (0, registro_mapper_1.toRegistrosItemRsList)(registros);
    }
    async getRegistrosByCategoria(categoriaId) {
        // Verificar que la categoría existe
        const categoriaExists = await this.registroRepository.checkCategoriaExists(categoriaId);
        if (!categoriaExists) {
            throw new error_types_1.ResourceNotFoundError("La categoría especificada no existe.");
        }
        const registros = await this.registroRepository.getByCategoriaId(categoriaId);
        return (0, registro_mapper_1.toRegistrosItemRsList)(registros);
    }
    async getRegistrosByDateRange(startDate, endDate, usuarioId) {
        const start = (0, date_1.parseDateToDateTime)(startDate);
        const end = (0, date_1.parseDateToDateTime)(endDate);
        if (start > end) {
            throw new error_types_1.BadRequestError("La fecha de inicio no puede ser mayor que la fecha de fin.");
        }
        // Si se especifica usuarioId, verificar que existe
        if (usuarioId) {
            const usuarioExists = await this.registroRepository.checkUsuarioExists(usuarioId);
            if (!usuarioExists) {
                throw new error_types_1.ResourceNotFoundError("El usuario especificado no existe.");
            }
        }
        const registros = await this.registroRepository.getByDateRange(start, end, usuarioId);
        return (0, registro_mapper_1.toRegistrosItemRsList)(registros);
    }
    async updateRegistro(id, data) {
        // Verificar que el registro existe
        const existingRegistro = await this.registroRepository.getById(id);
        if (!existingRegistro) {
            throw new error_types_1.ResourceNotFoundError("Registro no encontrado.");
        }
        // Verificar usuario si se proporciona
        if (data.id_usuario) {
            const usuarioExists = await this.registroRepository.checkUsuarioExists(data.id_usuario);
            if (!usuarioExists) {
                throw new error_types_1.ResourceNotFoundError("El usuario especificado no existe.");
            }
        }
        // Verificar categoría si se proporciona
        if (data.id_categoria) {
            const categoriaExists = await this.registroRepository.checkCategoriaExists(data.id_categoria);
            if (!categoriaExists) {
                throw new error_types_1.ResourceNotFoundError("La categoría especificada no existe.");
            }
        }
        const updateData = {};
        if (data.tipo)
            updateData.tipo = data.tipo;
        if (data.descripcion)
            updateData.descripcion = data.descripcion;
        if (data.monto !== undefined)
            updateData.monto = data.monto;
        if (data.fecha_registro)
            updateData.fechaRegistro = (0, date_1.parseDateToDateTime)(data.fecha_registro);
        if (data.id_usuario) {
            updateData.usuario = {
                connect: { idUsuario: data.id_usuario }
            };
        }
        if (data.id_categoria) {
            updateData.categoria = {
                connect: { idCategoria: data.id_categoria }
            };
        }
        const updatedRegistro = await this.registroRepository.update(id, updateData);
        return (0, registro_mapper_1.toRegistroDetailRs)(updatedRegistro);
    }
    async deleteRegistro(id) {
        // Verificar que el registro existe
        const existingRegistro = await this.registroRepository.getById(id);
        if (!existingRegistro) {
            throw new error_types_1.ResourceNotFoundError("Registro no encontrado.");
        }
        await this.registroRepository.delete(id);
    }
}
exports.RegistroService = RegistroService;
