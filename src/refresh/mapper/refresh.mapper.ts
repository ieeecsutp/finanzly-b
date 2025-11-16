import { RefreshRs } from "../response/refresh-rs";
import { RefreshToken } from "@prisma/client";

export function toRefreshRs(refresh: RefreshToken[]): RefreshRs[]{
    let newRefresh : RefreshRs[] = []
    refresh.forEach(e => {
        newRefresh.push({
            fechaCreacion: e.fechaCreacion.toISOString(),
            fechaExpiracion: e.fechaExpiracion.toISOString()
        })
    });
    return newRefresh;
}