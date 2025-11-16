"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const prisma_1 = require("./lib/prisma");
const routes_1 = __importDefault(require("./routes/routes"));
const auth_controller_1 = __importDefault(require("./auth/auth.controller"));
const error_handler_1 = require("./utils/error-handler");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
if (process.env.NODE_ENV !== "production") {
    process.loadEnvFile?.();
    (0, prisma_1.testConnection)();
}
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000; // 👈 backend corre en 4000
const AUTHOR = process.env.AUTHOR || "Desconocido";
app.use((0, cookie_parser_1.default)());
// Orígenes permitidos (frontend por defecto en 3000)
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Política de CORS: Acceso denegado desde este origen."));
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
// Ruta simple de prueba
app.get("/", (_req, res) => {
    res.send("✅ Backend Finanzly corriendo correctamente");
});
// Rutas con prefijo unificado
app.use("/api/v1/auth", auth_controller_1.default); // login, registro, etc.
app.use("/api/v1", routes_1.default); // resto de rutas
// Middleware de errores
app.use(error_handler_1.errorHandler);
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
}
exports.default = app;
