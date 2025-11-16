const http = require('http');

// Obtener el token del script anterior
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Obtener el token más reciente
    const latestToken = await prisma.passwordReset.findFirst({
      orderBy: { fechaCreacion: 'desc' },
      where: {
        usuario: { idUsuario: 3 } // Usuario Marcio
      }
    });

    if (!latestToken || new Date(latestToken.fechaExpiracion) < new Date()) {
      console.error('❌ Token inválido o expirado');
      process.exit(1);
    }

    const token = latestToken.token;
    const newPassword = 'NuevaContraseña123'; // Nueva contraseña fuerte

    console.log('🔄 Enviando solicitud de reset-password...');
    console.log(`Token: ${token}`);
    console.log(`Nueva contraseña: ${newPassword}\n`);

    const data = JSON.stringify({
      token,
      newPassword,
      confirmPassword: newPassword
    });

    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/auth/reset-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', async () => {
        console.log(`Status: ${res.statusCode}`);
        
        try {
          const parsedResponse = JSON.parse(responseData);
          console.log('Response:', JSON.stringify(parsedResponse, null, 2));
          
          if (res.statusCode === 200) {
            console.log('\n✅ ¡Contraseña cambiada exitosamente!');
            console.log(`\n📝 Credenciales de prueba:`);
            console.log(`Email: u22218661@utp.edu.pe`);
            console.log(`Nueva Contraseña: ${newPassword}`);
            console.log(`\nIntenta hacer login con estas credenciales en http://localhost:3001/login`);
          }
        } catch (e) {
          console.log('Response:', responseData);
        }
        
        await prisma.$disconnect();
        process.exit(0);
      });
    });

    req.on('error', async (error) => {
      console.error('❌ Error:', error);
      await prisma.$disconnect();
      process.exit(1);
    });

    req.write(data);
    req.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
