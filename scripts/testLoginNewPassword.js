const http = require('http');

const data = JSON.stringify({
  correo: 'u22218661@utp.edu.pe',
  contraseña: 'NuevaContraseña123'
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/v1/auth/login',
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

  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    
    try {
      const parsed = JSON.parse(responseData);
      console.log('Response:', JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ ¡LOGIN EXITOSO CON NUEVA CONTRASEÑA!');
        console.log(`\nToken recibido: ${parsed.data.access_token.substring(0, 50)}...`);
        console.log(`Usuario: ${parsed.data.usuario.nombre}`);
        console.log(`Email: ${parsed.data.usuario.correo}`);
      }
    } catch (e) {
      console.log('Response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error);
});

req.write(data);
req.end();
