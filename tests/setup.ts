import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Configurar timeout global para pruebas de integración
jest.setTimeout(10000);
