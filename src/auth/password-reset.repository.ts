import prisma from "../lib/prisma";
import crypto from "crypto";

export class PasswordResetRepository {
  async createResetToken(idUsuario: number): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1); // Token válido por 1 hora

    await prisma.passwordReset.create({
      data: {
        idUsuario,
        token,
        fechaExpiracion: expirationDate,
      },
    });

    return token;
  }

  async findResetToken(token: string) {
    return await prisma.passwordReset.findUnique({
      where: { token },
      include: { usuario: true },
    });
  }

  async deleteResetToken(token: string) {
    await prisma.passwordReset.delete({
      where: { token },
    });
  }

  async cleanupExpiredTokens() {
    await prisma.passwordReset.deleteMany({
      where: {
        fechaExpiracion: {
          lt: new Date(),
        },
      },
    });
  }
}
