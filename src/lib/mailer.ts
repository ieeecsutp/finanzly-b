// Flexible mailer util: usa SendGrid → SMTP (Gmail/custom) → console.log

import nodemailer from 'nodemailer';

type SendResult = { success: boolean; info?: any };

export async function sendResetEmail(to: string, resetUrl: string, token: string): Promise<SendResult> {
  const from = process.env.EMAIL_FROM || "noreply@finanzly.local";

  // ============================================
  // Opción 1: SendGrid (producción recomendada)
  // ============================================
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sgMail = require("@sendgrid/mail");
    const apiKey = process.env.SENDGRID_API_KEY;

    if (apiKey) {
      sgMail.setApiKey(apiKey);
      const msg = {
        to,
        from,
        subject: "Recuperación de contraseña - Finanzly",
        html: buildEmailHtml(resetUrl, token),
      };

      const info = await sgMail.send(msg);
      console.log(`✅ Email sent via SendGrid to ${to}`);
      return { success: true, info };
    }
  } catch (err) {
    console.warn("SendGrid not available. Trying SMTP...", (err as any)?.message);
  }

  // ============================================
  // Opción 2: SMTP (Gmail, custom, etc.)
  // ============================================
  try {
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true para puerto 465 (TLS), false para 587 (STARTTLS)
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: from || smtpUser, // usar EMAIL_FROM si está set, sino usar SMTP_USER
        to,
        subject: "Recuperación de contraseña - Finanzly",
        html: buildEmailHtml(resetUrl, token),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent via SMTP to ${to}:`, info.response);
      return { success: true, info };
    }
  } catch (err) {
    console.warn("SMTP not available or failed. Falling back to console log.", (err as any)?.message);
  }

  // ============================================
  // Fallback: Loguear en consola para desarrollo
  // ============================================
  console.log(`\n🔗 [DEV] Reset URL for ${to}: ${resetUrl}`);
  console.log(`🔐 [DEV] Token: ${token}\n`);
  return { success: false, info: { token, resetUrl } };
}

function buildEmailHtml(resetUrl: string, token: string): string {
  return `
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
}
