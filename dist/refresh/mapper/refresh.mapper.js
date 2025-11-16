"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toRefreshRs = toRefreshRs;
function toRefreshRs(refresh) {
    let newRefresh = [];
    refresh.forEach(e => {
        newRefresh.push({
            fechaCreacion: e.fechaCreacion.toISOString(),
            fechaExpiracion: e.fechaExpiracion.toISOString()
        });
    });
    return newRefresh;
}
