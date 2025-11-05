import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

export default async function globalSetup() {
    console.log('\n🔧 Configurando ambiente de pruebas...');
    
    // Cargar variables de entorno de .env.test
    dotenv.config({ path: '.env.test' });

    try {
        // Ejecutar migraciones de Prisma en la BD de pruebas
        console.log('📦 Ejecutando migraciones de Prisma...');
        execSync('npx prisma migrate deploy', {
            env: {
                ...process.env,
                NODE_ENV: 'test',
                DATABASE_URL: process.env.DATABASE_URL
            },
            stdio: 'inherit'
        });
        console.log('✅ Migraciones completadas\n');
    } catch (error) {
        console.error('❌ Error ejecutando migraciones:', error);
        throw error;
    }
}
