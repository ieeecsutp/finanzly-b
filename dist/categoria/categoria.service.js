"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaService = void 0;
const categoria_repository_1 = require("./categoria.repository");
const error_types_1 = require("../utils/error-types");
const categoria_mapper_1 = require("./mapper/categoria.mapper");
const registro_mapper_1 = require("../registro/mapper/registro.mapper");
class CategoriaService {
    categoriaRepository = new categoria_repository_1.CategoriaRepository();
    async createCategoria(data) {
        // Verificar que no exista otra categoría con el mismo nombre y tipo
        const existingCategoria = await this.categoriaRepository.getByNombreAndTipo(data.nombre, data.tipo);
        if (existingCategoria) {
            throw new error_types_1.DuplicateResourceError(`Ya existe una categoría "${data.nombre}" de tipo "${data.tipo}".`);
        }
        const categoriaData = {
            nombre: data.nombre.trim(),
            tipo: data.tipo,
        };
        const categoria = await this.categoriaRepository.create(categoriaData);
        return (0, categoria_mapper_1.toCategoriaDetailRs)(categoria);
    }
    async getAllCategorias() {
        const categorias = await this.categoriaRepository.getAll();
        return (0, categoria_mapper_1.toCategoriasItemRsList)(categorias);
    }
    async getCategoriaById(id) {
        const categoria = await this.categoriaRepository.getById(id);
        if (!categoria) {
            throw new error_types_1.ResourceNotFoundError("Categoría no encontrada.");
        }
        return (0, categoria_mapper_1.toCategoriaDetailRs)(categoria);
    }
    async getCategoriasByTipo(tipo) {
        // Validar que el tipo sea válido
        const tiposValidos = ["ingreso", "gasto", "transferencia", "ahorro"];
        if (!tiposValidos.includes(tipo)) {
            throw new error_types_1.BadRequestError("El tipo debe ser: ingreso, gasto, transferencia o ahorro.");
        }
        const categorias = await this.categoriaRepository.getByTipo(tipo);
        return (0, categoria_mapper_1.toCategoriasItemRsList)(categorias);
    }
    async getRegistrosByCategoria(categoriaId) {
        // Verificar que la categoría existe
        const categoria = await this.categoriaRepository.getById(categoriaId);
        if (!categoria) {
            throw new error_types_1.ResourceNotFoundError("Categoría no encontrada.");
        }
        const registros = await this.categoriaRepository.getRegistrosByCategoriaId(categoriaId);
        return (0, registro_mapper_1.toRegistrosItemRsList)(registros);
    }
    async updateCategoria(id, data) {
        // Verificar que la categoría existe
        const existingCategoria = await this.categoriaRepository.getById(id);
        if (!existingCategoria) {
            throw new error_types_1.ResourceNotFoundError("Categoría no encontrada.");
        }
        // Si se está actualizando nombre o tipo, verificar que no se duplique
        if (data.nombre || data.tipo) {
            const nombreToCheck = data.nombre ? data.nombre.trim() : existingCategoria.nombre;
            const tipoToCheck = data.tipo || existingCategoria.tipo;
            const duplicateCategoria = await this.categoriaRepository.getByNombreAndTipoExcludingId(nombreToCheck, tipoToCheck, id);
            if (duplicateCategoria) {
                throw new error_types_1.DuplicateResourceError(`Ya existe una categoría "${nombreToCheck}" de tipo "${tipoToCheck}".`);
            }
        }
        const updateData = {};
        if (data.nombre)
            updateData.nombre = data.nombre.trim();
        if (data.tipo)
            updateData.tipo = data.tipo;
        const updatedCategoria = await this.categoriaRepository.update(id, updateData);
        return (0, categoria_mapper_1.toCategoriaDetailRs)(updatedCategoria);
    }
    async deleteCategoria(id) {
        // Verificar que la categoría existe
        const existingCategoria = await this.categoriaRepository.getById(id);
        if (!existingCategoria) {
            throw new error_types_1.ResourceNotFoundError("Categoría no encontrada.");
        }
        // Verificar que no tiene registros asociados
        const hasRegistros = await this.categoriaRepository.hasRegistros(id);
        if (hasRegistros) {
            throw new error_types_1.BadRequestError("No se puede eliminar la categoría porque tiene registros asociados.");
        }
        await this.categoriaRepository.delete(id);
    }
    async getCategoriaStats(id) {
        // Verificar que la categoría existe
        const categoria = await this.categoriaRepository.getById(id);
        if (!categoria) {
            throw new error_types_1.ResourceNotFoundError("Categoría no encontrada.");
        }
        const stats = await this.categoriaRepository.getCategoriaStats(id);
        return {
            id_categoria: id,
            nombre: categoria.nombre,
            tipo: categoria.tipo,
            total_registros: stats.totalRegistros,
            monto_total: stats.montoTotal,
        };
    }
}
exports.CategoriaService = CategoriaService;
