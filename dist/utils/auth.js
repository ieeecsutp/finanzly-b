"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_TOKEN_COOKIE_OPTIONS = exports.verifyUserMatch = exports.verifyToken = void 0;
exports.verifyPassword = verifyPassword;
exports.getPasswordHash = getPasswordHash;
exports.createAccessToken = createAccessToken;
exports.createRefreshToken = createRefreshToken;
exports.getRefreshTokenExpiration = getRefreshTokenExpiration;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const error_types_1 = require("../utils/error-types");
const settings = {
    access_token_expire_minutes: 15,
    refresh_token_expire_days: 7,
    secret_key: process.env.JWT_ACCESS_SECRET || "mi_secreto_super_seguro",
    refresh_secret_key: process.env.JWT_REFRESH_SECRET || "mi_refresh_secreto_super_seguro"
};
// Verificar contraseña
function verifyPassword(plainPassword, hashedPassword) {
    try {
        return bcrypt_1.default.compareSync(plainPassword, hashedPassword);
    }
    catch (err) {
        return false;
    }
}
// Hashear contraseña
function getPasswordHash(password) {
    const salt = bcrypt_1.default.genSaltSync(10);
    return bcrypt_1.default.hashSync(password, salt);
}
// Crear access token
function createAccessToken(data, expiresInMinutes = null) {
    const payload = { ...data };
    const expiresIn = expiresInMinutes || settings.access_token_expire_minutes;
    return jsonwebtoken_1.default.sign(payload, settings.secret_key, {
        algorithm: "HS256",
        expiresIn: `${expiresIn}m`
    });
}
function createRefreshToken() {
    return crypto_1.default.randomBytes(64).toString('hex');
}
function getRefreshTokenExpiration() {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + settings.refresh_token_expire_days);
    return expirationDate;
}
const verifyToken = (req, res, next) => {
    let token;
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
        throw new error_types_1.UnauthorizedError("Token requerido.");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, settings.secret_key);
        if (typeof decoded === "string") {
            throw new error_types_1.UnauthorizedError("Token inválido.");
        }
        req.user = decoded; // guardamos el payload del JWT en req.user
        next();
    }
    catch (error) {
        throw new error_types_1.UnauthorizedError("Token invalido o expirado.");
    }
};
exports.verifyToken = verifyToken;
// Para verificar usuario
const verifyUserMatch = (req, res, next) => {
    const paramId = req.params.id;
    if (!paramId)
        throw new error_types_1.UnauthorizedError("El parámetro id es requerido.");
    if (req.user?.id?.toString() !== paramId) {
        throw new error_types_1.UnauthorizedError("No autorizado para acceder a este recurso.");
    }
    next();
};
exports.verifyUserMatch = verifyUserMatch;
exports.REFRESH_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true, // No accesible desde JavaScript
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Menos restrictivo en desarrollo
    maxAge: settings.refresh_token_expire_days * 24 * 60 * 60 * 1000, // 7 días en ms
    path: '/api/auth' // Ruta correcta de auth
};
