const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Simular directamente el sendResetEmail
    console.log('Importando mailer...');
    const { sendResetEmail } = require('../dist/lib/mailer');
    
    console.log('Enviando email de prueba...');
    const result = await sendResetEmail(
      'u22218661@utp.edu.pe',
      'http://localhost:3000/reset-password?token=testtoken123'
    );
    
    console.log('✅ Email enviado:', result);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
})();
