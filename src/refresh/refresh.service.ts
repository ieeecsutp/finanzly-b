import { Prisma } from "@prisma/client"; 
import { RefreshRepository } from "./refresh.repository";
import { RefreshRs } from "./response/refresh-rs";
import { DuplicateResourceError, ResourceNotFoundError } from "../utils/error-types";
import { toRefreshRs } from "./mapper/refresh.mapper";

export class RefreshService{
    private refreshRepository = new RefreshRepository();

    async getActiveSessions(id: number): Promise<RefreshRs[]> {
        const refresh = await this.refreshRepository.getActiveSessions(id);
        return toRefreshRs(refresh);
    }
}