const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Actualizando emails a minúsculas...');
    
    const updated = await prisma.usuario.update({
      where: { idUsuario: 3 },
      data: { correo: 'u22218661@utp.edu.pe' },
    });
    
    console.log('✅ Usuario actualizado:', updated);
    
    const allUsers = await prisma.usuario.findMany();
    console.log('\nTodos los usuarios:', allUsers);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
