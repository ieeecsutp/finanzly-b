import { Request, Response, NextFunction, CookieOptions } from "express";
import bcrypt from "bcrypt";
import jwt ,{ JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import { BadRequestError, DuplicateResourceError, ResourceNotFoundError, UnauthorizedError } from "../utils/error-types";

const settings = {
  access_token_expire_minutes: 15,
  refresh_token_expire_days: 7,
  secret_key: process.env.JWT_ACCESS_SECRET || "mi_secreto_super_seguro",
  refresh_secret_key: process.env.JWT_REFRESH_SECRET || "mi_refresh_secreto_super_seguro" 
};

// --- Extensión de la interfaz Request para TypeScript ---
declare module "express-serve-static-core" {
  interface Request {
    user?: AuthPayload; 
  }
}

interface AuthPayload extends jwt.JwtPayload {
  id: number;
  nombre: string;
  correo: string;
}

// Verificar contraseña
export function verifyPassword(plainPassword: string, hashedPassword: string) {
  try {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  } catch (err) {
    return false;
  }
}

// Hashear contraseña
export function getPasswordHash(password: string) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

// Crear access token
export function createAccessToken(data : Object, expiresInMinutes = null) {
  const payload = { ...data };
  const expiresIn = expiresInMinutes || settings.access_token_expire_minutes;

  return jwt.sign(payload, settings.secret_key, {
    algorithm: "HS256",
    expiresIn: `${expiresIn}m`
  });
}

export function createRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function getRefreshTokenExpiration(): Date {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + settings.refresh_token_expire_days);
  return expirationDate;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Intentar obtener el token del header Authorization
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    token = authHeader.split(" ")[1]; // "Bearer <token>"
  }

  // 2. Si no está en el header, buscar en cookies
  if (!token && req.cookies) {
    token = req.cookies.token; // Nombre de tu cookie
  }

  // 3. Si no hay token en ningún lugar
  if (!token) {
    throw new UnauthorizedError("Token requerido.");
  }

  try {
    const decoded = jwt.verify(token, settings.secret_key);

    if (typeof decoded === "string") {
      throw new UnauthorizedError("Token inválido.");
    }

    req.user = decoded as AuthPayload; // guardamos el payload del JWT en req.user
    next();
  } catch (error) {
    throw new UnauthorizedError("Token invalido o expirado.");
  }
};


// Para verificar usuario

export const verifyUserMatch = (req: Request, res: Response, next: NextFunction) => {
  const paramId = req.params.id;
  if (!paramId) throw new UnauthorizedError("El parámetro id es requerido.");

  if (req.user?.id?.toString() !== paramId) {
    throw new UnauthorizedError("No autorizado para acceder a este recurso.");
  }

  next();
};

export const REFRESH_TOKEN_COOKIE_OPTIONS : CookieOptions = {
  httpOnly: true, // No accesible desde JavaScript
  secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' as const, // Menos restrictivo en desarrollo
  maxAge: settings.refresh_token_expire_days * 24 * 60 * 60 * 1000, // 7 días en ms
  path: '/api/auth' // Ruta correcta de auth
};