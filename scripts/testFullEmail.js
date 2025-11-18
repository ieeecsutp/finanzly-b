// Carga las variables de entorno
if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const nodemailer = require('nodemailer');

(async () => {
  try {
    const resetUrl = 'http://localhost:3000/reset-password?token=9814278d5304b34be300efbdf92a422ef1a5ad33e5aeb391c053c5211c6456d5';
    const token = '9814278d5304b34be300efbdf92a422ef1a5ad33e5aeb391c053c5211c6456d5';
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: parseInt(process.env.SMTP_PORT || "587") === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0066cc;">Recuperación de contraseña</h2>
      <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
      <p>
        <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Restablecer mi contraseña
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">O copia y pega este enlace en tu navegador:</p>
      <p style="background-color: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px;">
        ${resetUrl}
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="color: #666; font-size: 12px;">Si no solicitaste este cambio, ignora este correo.</p>
      <p style="color: #999; font-size: 11px;">Este enlace es válido por 1 hora.</p>
    </div>
    `;

    console.log('📤 Enviando email con formato final...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Enviamos a la misma cuenta para prueba
      subject: 'Recuperación de contraseña - Finanzly',
      html: htmlContent,
    });

    console.log('✅ Email de recuperación de contraseña enviado!');
    console.log('Respuesta SMTP:', info.response);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
