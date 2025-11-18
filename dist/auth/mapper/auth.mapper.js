"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAuthLoginRs = toAuthLoginRs;
exports.toUserRs = toUserRs;
function toAuthLoginRs(authLogin) {
    return {
        access_token: authLogin.access_token,
        token_type: authLogin.token_type,
        usuario: toUserRs(authLogin.usuario),
        refresh_token: authLogin.refresh_token
    };
}
function toUserRs(usuario) {
    return {
        id: usuario.idUsuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
    };
}
