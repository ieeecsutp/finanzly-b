const { PrismaClient } = require('@prisma/client');

(async () => {
  try {
    const prisma = new PrismaClient();
    const users = await prisma.usuario.findMany({ select: { idUsuario: true, nombre: true, correo: true } });
    console.log('Usuarios en BD:', users);
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error listando usuarios:', err);
    process.exit(1);
  }
})();
