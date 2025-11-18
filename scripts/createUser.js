const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

(async () => {
  try {
    const prisma = new PrismaClient();
    
    const hashedPassword = bcrypt.hashSync('123456789', 10);
    const user = await prisma.usuario.upsert({
      where: { correo: 'U22218661@utp.edu.pe' },
      update: {},
      create: {
        nombre: 'Marcio',
        correo: 'U22218661@utp.edu.pe',
        contraseña: hashedPassword
      }
    });
    
    console.log('✅ Usuario creado:', { id: user.idUsuario, nombre: user.nombre, correo: user.correo });
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
