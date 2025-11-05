// tests/globalTeardown.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function globalTeardown() {
    console.log('\n🧹 Limpiando ambiente de pruebas...');
    
    try {
        // Eliminar en orden correcto respetando las relaciones
        await prisma.refreshToken.deleteMany({});
        await prisma.usuario.deleteMany({});
        console.log('✅ Base de datos limpiada\n');
    } catch (error) {
        console.error('❌ Error limpiando BD:', error);
    } finally {
        await prisma.$disconnect();
    }
}
