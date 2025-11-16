const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const tokens = await prisma.passwordReset.findMany();
    console.log('✅ Tokens en BD:', tokens.length > 0 ? tokens : 'Sin tokens');
    
    if (tokens.length > 0) {
      console.log('\nDetalles del último token:');
      const latest = tokens[tokens.length - 1];
      console.log('- idReset:', latest.idReset);
      console.log('- idUsuario:', latest.idUsuario);
      console.log('- token:', latest.token.substring(0, 10) + '...');
      console.log('- fechaExpiracion:', latest.fechaExpiracion);
    }
  } finally {
    await prisma.$disconnect();
  }
})();
