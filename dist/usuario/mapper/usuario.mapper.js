"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserDetailRs = toUserDetailRs;
function toUserDetailRs(usuario) {
    return {
        id_usuario: usuario.idUsuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        fechaCreado: usuario.fechaCreado.toISOString().split("T")[0],
    };
}
