const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Obteniendo tokens de reset pendientes...\n');
    
    const tokens = await prisma.passwordReset.findMany({
      include: {
        usuario: {
          select: {
            idUsuario: true,
            nombre: true,
            correo: true,
          }
        }
      },
      orderBy: { fechaCreacion: 'desc' }
    });
    
    if (tokens.length === 0) {
      console.log('❌ No hay tokens de reset en la BD');
      return;
    }
    
    tokens.forEach((t, i) => {
      const isExpired = new Date(t.fechaExpiracion) < new Date();
      const expiresIn = Math.round((new Date(t.fechaExpiracion) - new Date()) / 1000);
      
      console.log(`Token ${i + 1}:`);
      console.log(`  Usuario: ${t.usuario.nombre} (${t.usuario.correo})`);
      console.log(`  Token: ${t.token}`);
      console.log(`  Creado: ${new Date(t.fechaCreacion).toLocaleString('es-CO')}`);
      console.log(`  Expira: ${new Date(t.fechaExpiracion).toLocaleString('es-CO')}`);
      console.log(`  Estado: ${isExpired ? '❌ EXPIRADO' : `✅ ACTIVO (${expiresIn}s)`}`);
      console.log(`\n  🔗 Reset URL: http://localhost:3000/reset-password?token=${t.token}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
