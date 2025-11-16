-- DropForeignKey
ALTER TABLE "Categoria" DROP CONSTRAINT "Categoria_idPrioridad_fkey";

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_id_prioridad_fkey" FOREIGN KEY ("id_prioridad") REFERENCES "Prioridad"("id_prioridad") ON DELETE SET NULL ON UPDATE CASCADE;
