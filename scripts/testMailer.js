// Carga las variables de entorno
if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const nodemailer = require('nodemailer');

(async () => {
  try {
    console.log('📧 Creando transporte SMTP...');
    
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const emailFrom = process.env.EMAIL_FROM;

    console.log('Config:');
    console.log('- Host:', smtpHost);
    console.log('- Port:', smtpPort);
    console.log('- User:', smtpUser ? smtpUser.substring(0, 5) + '***' : 'undefined');
    console.log('- Pass:', smtpPass ? 'set' : 'undefined');
    console.log('- From:', emailFrom);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    console.log('\n✅ Transporte creado. Verificando conexión...');
    await transporter.verify();
    console.log('✅ Conexión verificada!');

    console.log('\n📤 Enviando email de prueba...');
    const info = await transporter.sendMail({
      from: emailFrom || smtpUser,
      to: 'u22218661@utp.edu.pe',
      subject: 'Prueba de Reset Password - Finanzly',
      html: `<h1>Test</h1><p>Este es un email de prueba del sistema de recuperación de contraseña.</p>`,
    });

    console.log('✅ Email enviado!');
    console.log('Response:', info.response);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
  }
})();
