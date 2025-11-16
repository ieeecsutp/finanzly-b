import { Request, Response, NextFunction, Router } from "express";
import { verifyToken, verifyUserMatch } from "../utils/auth";
import { RefreshService } from "./refresh.service";
import { ApiResponse } from "../utils/api-response";
import { RefreshRs } from "./response/refresh-rs";
import { ResourceNotFoundError } from "../utils/error-types";

const router = Router();
const refreshService = new RefreshService();

// GET /history - Obtener historial de usuario

router.get("/history",
    verifyToken,
    async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new ResourceNotFoundError("El usuario especificado no existe.");
        }
        const refresh = await refreshService.getActiveSessions(req.user.id);

        const response: ApiResponse<RefreshRs[]> = {
            status: "success",
            message: "Historial encontrado",
            data: refresh,
        };

        res.json(response);
    }catch(error){
        next(error);
    }
});

export default router;