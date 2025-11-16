-- CreateTable
CREATE TABLE "PasswordReset" (
    "id_reset" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "fechaExpiracion" TIMESTAMP(3) NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id_reset")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
