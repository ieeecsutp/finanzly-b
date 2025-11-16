import { Request, Response, NextFunction, Router } from "express";
import { AuthService } from "./auth.service";
import { ApiResponse } from "../utils/api-response";
import { validateRequest } from "../utils/validate-request";
import { authRegisterRq } from "./request/auth-register-rq";
import { authLoginRq } from "./request/auth-login-rq";
import { forgotPasswordRq } from "./request/forgot-password-rq";
import { resetPasswordRq } from "./request/reset-password-rq";
import { AuthLoginRs } from "./response/auth-login-rs";
import { UsuarioRs } from "./response/auth-register-rs";
import { ForgotPasswordRs, ResetPasswordRs } from "./response/password-reset-rs";
import { verifyToken, REFRESH_TOKEN_COOKIE_OPTIONS } from "../utils/auth";
import { UsuarioRepository } from "../usuario/usuario.repository";

const router = Router();
const usuaurioRepository = new UsuarioRepository();
const authService = new AuthService(usuaurioRepository);

router.post("/register",
    authRegisterRq(), 
    validateRequest("Datos invalidos"),
    async (req: Request, res: Response, next: NextFunction) => {
        try{
            const data = req.body;
            const newUsuario = await authService.createAuth(data);

            const response: ApiResponse<UsuarioRs> = {
                status: "success",
                message: "Usuaio creado exitosamente",
                data: newUsuario,
            };

            res.status(201).json(response);
        }catch (error){
            next(error);
        }
    }    
);

router.post("/login",
    authLoginRq(), 
    validateRequest("Datos invalidos"),
    async (req: Request, res: Response, next: NextFunction) => {
        try{
            const data = req.body;
            const loginData = await authService.loginAuth(data.correo,data.contraseña);

            res.cookie('refreshToken', loginData.refresh_token, REFRESH_TOKEN_COOKIE_OPTIONS);

            const response: ApiResponse<AuthLoginRs> = {
                status: "success",
                message: "Usuaio logeado exitosamente",
                data: loginData,
            };

            res.status(201).json(response);
        }catch (error){
            next(error);
        }
    }    
);

router.post("/refresh",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Obtener refresh token de la cookie
            const refreshToken = req.cookies?.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({
                    status: "error",
                    message: "Refresh token no proporcionado",
                });
            }

            // Renovar tokens
            const { accessToken, newRefreshToken } = await authService.refreshAccessToken(refreshToken);

            // ✅ Actualizar cookie con nuevo refresh token (token rotation)
            res.cookie('refreshToken', newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

            const response: ApiResponse<{ access_token: string; token_type: string }> = {
                status: "success",
                message: "Token renovado exitosamente",
                data: {
                    access_token: accessToken,
                    token_type: "bearer"
                },
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
);


router.get("/test",
    verifyToken, 
    async (req: Request, res: Response, next: NextFunction) => {
        try{
            const data = {
                user: req.user
            }

            const response: ApiResponse<Object> = {
                status: "success",
                message: "Usuario autenticado",
                data: data,
            }

            res.status(201).json(response)
        }catch(error){
            next(error);
        }
    }
);

router.post("/forgot-password",
    forgotPasswordRq(),
    validateRequest("Datos invalidos"),
    async (req: Request, res: Response, next: NextFunction) => {
        try{
            const { correo } = req.body;
            const result = await authService.requestPasswordReset(correo);

            const response: ApiResponse<ForgotPasswordRs> = {
                status: "success",
                message: result.message,
                data: result,
            };

            res.status(200).json(response);
        }catch(error){
            next(error);
        }
    }
);

router.post("/reset-password",
    resetPasswordRq(),
    validateRequest("Datos invalidos"),
    async (req: Request, res: Response, next: NextFunction) => {
        try{
            const { token, newPassword } = req.body;
            const result = await authService.resetPassword(token, newPassword);

            const response: ApiResponse<ResetPasswordRs> = {
                status: "success",
                message: result.message,
                data: result,
            };

            res.status(200).json(response);
        }catch(error){
            next(error);
        }
    }
);

export default router;