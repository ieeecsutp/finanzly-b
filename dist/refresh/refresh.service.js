"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshService = void 0;
const refresh_repository_1 = require("./refresh.repository");
const refresh_mapper_1 = require("./mapper/refresh.mapper");
class RefreshService {
    refreshRepository = new refresh_repository_1.RefreshRepository();
    async getActiveSessions(id) {
        const refresh = await this.refreshRepository.getActiveSessions(id);
        return (0, refresh_mapper_1.toRefreshRs)(refresh);
    }
}
exports.RefreshService = RefreshService;
