"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCategoriaDetailRs = toCategoriaDetailRs;
exports.toCategoriaItemRs = toCategoriaItemRs;
exports.toCategoriasItemRsList = toCategoriasItemRsList;
/**
 * Convierte una categoría con relaciones a CategoriaDetailRs
 * Incluye estadísticas de registros y monto total
 */
function toCategoriaDetailRs(categoria) {
    const montoTotal = categoria.registros.reduce((total, registro) => {
        return total + parseFloat(registro.monto.toString());
    }, 0);
    return {
        id_categoria: categoria.idCategoria,
        nombre: categoria.nombre,
        tipo: categoria.tipo,
        total_registros: categoria.registros.length,
        monto_total: montoTotal,
    };
}
/**
 * Convierte una categoría con relaciones a CategoriaItemRs
 * Versión resumida para listados
 */
function toCategoriaItemRs(categoria) {
    return {
        id_categoria: categoria.idCategoria,
        nombre: categoria.nombre,
        tipo: categoria.tipo,
        total_registros: categoria.registros.length,
    };
}
/**
 * Convierte un array de categorías con relaciones a un array de CategoriaItemRs
 */
function toCategoriasItemRsList(categorias) {
    return categorias.map(categoria => toCategoriaItemRs(categoria));
}
