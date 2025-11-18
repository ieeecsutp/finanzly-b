"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toRegistroDetailRs = toRegistroDetailRs;
exports.toRegistroItemRs = toRegistroItemRs;
exports.toRegistrosItemRsList = toRegistrosItemRsList;
const date_1 = require("../../utils/date");
/**
 * Convierte un registro con relaciones a RegistroDetailRs
 * Incluye información completa del usuario y categoría
 */
function toRegistroDetailRs(registro) {
    return {
        id_registro: registro.idRegistro,
        tipo: registro.tipo,
        descripcion: registro.descripcion,
        monto: parseFloat(registro.monto.toString()),
        fecha_registro: (0, date_1.formatDateToISO)(registro.fechaRegistro),
        fecha_creacion: (0, date_1.formatDateToISO)(registro.fechaCreacion),
        usuario: {
            id_usuario: registro.usuario.idUsuario,
            nombre: registro.usuario.nombre,
        },
        categoria: {
            id_categoria: registro.categoria.idCategoria,
            nombre: registro.categoria.nombre,
            tipo: registro.categoria.tipo,
        },
    };
}
/**
 * Convierte un registro con relaciones a RegistroItemRs
 * Versión resumida para listados
 */
function toRegistroItemRs(registro) {
    return {
        id_registro: registro.idRegistro,
        tipo: registro.tipo,
        descripcion: registro.descripcion,
        monto: parseFloat(registro.monto.toString()),
        fecha_registro: (0, date_1.formatDateToISO)(registro.fechaRegistro),
        usuario: {
            id_usuario: registro.usuario.idUsuario,
            nombre: registro.usuario.nombre,
        },
        categoria: {
            id_categoria: registro.categoria.idCategoria,
            nombre: registro.categoria.nombre,
            tipo: registro.categoria.tipo,
        },
    };
}
/**
 * Convierte un array de registros con relaciones a un array de RegistroItemRs
 */
function toRegistrosItemRsList(registros) {
    return registros.map(registro => toRegistroItemRs(registro));
}
