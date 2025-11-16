"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = testConnection;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function testConnection() {
    try {
        await prisma.$connect();
        console.log('✅ Conexión a la base de datos establecida correctamente.');
    }
    catch (error) {
        console.error('❌ Error al conectar con la base de datos:\n', error);
        // process.exit(1); // Sale del proceso si no hay conexión
    }
}
exports.default = prisma;
