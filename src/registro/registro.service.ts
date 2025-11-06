import { Prisma } from "@prisma/client";
import { RegistroRepository } from "./registro.repository";
import { RegistroDetailRs } from "./response/registro-detail-rs";
import { RegistroItemRs } from "./response/registro-item-rs";
import { ResourceNotFoundError, BadRequestError } from "../utils/error-types";
import { toRegistroDetailRs, toRegistrosItemRsList } from "./mapper/registro.mapper";
import { parseDateToDateTime } from "../utils/date";

interface RegistroCreateInput {
    id_usuario: number;
    id_categoria: number;
    tipo: string;
    descripcion: string;
    monto: number;
    fecha_registro: string | Date;
}

interface RegistroUpdateInput {
    id_usuario?: number;
    id_categoria?: number;
    tipo?: string;
    descripcion?: string;
    monto?: number;
    fecha_registro?: string | Date;
}

export class RegistroService {
    private registroRepository = new RegistroRepository();
    
    /**
     * Obtener balances agregados para un usuario
     * - balance_total: ingresos - gastos (todos los registros)
     * - ingresos_mensuales/gastos_mensuales: para el mes actual
     */
    async getBalances(usuarioId: number): Promise<{ balance_total: number; ingresos_mensuales: number; gastos_mensuales: number }> {
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

    async createRegistro(data: RegistroCreateInput): Promise<RegistroDetailRs> {
        // Verificar que el usuario existe
        const usuarioExists = await this.registroRepository.checkUsuarioExists(data.id_usuario);
        if (!usuarioExists) {
            throw new ResourceNotFoundError("El usuario especificado no existe.");
        }

        // Verificar que la categoría existe
        const categoriaExists = await this.registroRepository.checkCategoriaExists(data.id_categoria);
        if (!categoriaExists) {
            throw new ResourceNotFoundError("La categoría especificada no existe.");
        }

        const registroData: Prisma.RegistroCreateInput = {
            tipo: data.tipo,
            descripcion: data.descripcion,
            monto: data.monto,
            fechaRegistro: parseDateToDateTime(data.fecha_registro),
            fechaCreacion: new Date(),
            usuario: {
                connect: { idUsuario: data.id_usuario }
            },
            categoria: {
                connect: { idCategoria: data.id_categoria }
            }
        };

        const registro = await this.registroRepository.create(registroData);
        return toRegistroDetailRs(registro as any);
    }

    async getAllRegistros(): Promise<RegistroItemRs[]> {
        const registros = await this.registroRepository.getAll();
        return toRegistrosItemRsList(registros as any);
    }

    async getRegistroById(id: number): Promise<RegistroDetailRs> {
        const registro = await this.registroRepository.getById(id);
        if (!registro) {
            throw new ResourceNotFoundError("Registro no encontrado.");
        }
        return toRegistroDetailRs(registro as any);
    }

    async getRegistrosByUsuario(usuarioId: number): Promise<RegistroItemRs[]> {
        // Verificar que el usuario existe
        const usuarioExists = await this.registroRepository.checkUsuarioExists(usuarioId);
        if (!usuarioExists) {
            throw new ResourceNotFoundError("El usuario especificado no existe.");
        }

        const registros = await this.registroRepository.getByUsuarioId(usuarioId);
        return toRegistrosItemRsList(registros as any);
    }

    async getRegistrosByCategoria(categoriaId: number): Promise<RegistroItemRs[]> {
        // Verificar que la categoría existe
        const categoriaExists = await this.registroRepository.checkCategoriaExists(categoriaId);
        if (!categoriaExists) {
            throw new ResourceNotFoundError("La categoría especificada no existe.");
        }

        const registros = await this.registroRepository.getByCategoriaId(categoriaId);
        return toRegistrosItemRsList(registros as any);
    }

    async getRegistrosByDateRange(
        startDate: string | Date, 
        endDate: string | Date, 
        usuarioId?: number
    ): Promise<RegistroItemRs[]> {
        const start = parseDateToDateTime(startDate);
        const end = parseDateToDateTime(endDate);

        if (start > end) {
            throw new BadRequestError("La fecha de inicio no puede ser mayor que la fecha de fin.");
        }

        // Si se especifica usuarioId, verificar que existe
        if (usuarioId) {
            const usuarioExists = await this.registroRepository.checkUsuarioExists(usuarioId);
            if (!usuarioExists) {
                throw new ResourceNotFoundError("El usuario especificado no existe.");
            }
        }

        const registros = await this.registroRepository.getByDateRange(start, end, usuarioId);
        return toRegistrosItemRsList(registros as any);
    }

    async updateRegistro(id: number, data: RegistroUpdateInput): Promise<RegistroDetailRs> {
        // Verificar que el registro existe
        const existingRegistro = await this.registroRepository.getById(id);
        if (!existingRegistro) {
            throw new ResourceNotFoundError("Registro no encontrado.");
        }

        // Verificar usuario si se proporciona
        if (data.id_usuario) {
            const usuarioExists = await this.registroRepository.checkUsuarioExists(data.id_usuario);
            if (!usuarioExists) {
                throw new ResourceNotFoundError("El usuario especificado no existe.");
            }
        }

        // Verificar categoría si se proporciona
        if (data.id_categoria) {
            const categoriaExists = await this.registroRepository.checkCategoriaExists(data.id_categoria);
            if (!categoriaExists) {
                throw new ResourceNotFoundError("La categoría especificada no existe.");
            }
        }

        const updateData: Prisma.RegistroUpdateInput = {};

        if (data.tipo) updateData.tipo = data.tipo;
        if (data.descripcion) updateData.descripcion = data.descripcion;
        if (data.monto !== undefined) updateData.monto = data.monto;
        if (data.fecha_registro) updateData.fechaRegistro = parseDateToDateTime(data.fecha_registro);
        
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
        return toRegistroDetailRs(updatedRegistro as any);
    }

    async deleteRegistro(id: number): Promise<void> {
        // Verificar que el registro existe
        const existingRegistro = await this.registroRepository.getById(id);
        if (!existingRegistro) {
            throw new ResourceNotFoundError("Registro no encontrado.");
        }

        await this.registroRepository.delete(id);
    }
}