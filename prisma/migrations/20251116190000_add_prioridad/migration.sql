-- Create table Prioridad
CREATE TABLE "Prioridad" (
    "id_prioridad" SERIAL NOT NULL,
    "nivel" TEXT NOT NULL,
    CONSTRAINT "Prioridad_pkey" PRIMARY KEY ("id_prioridad")
);

-- Add column id_prioridad (nullable) to Categoria
ALTER TABLE "Categoria" ADD COLUMN IF NOT EXISTS "id_prioridad" INTEGER;

-- Add foreign key constraint from Categoria.id_prioridad -> Prioridad.id_prioridad
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_idPrioridad_fkey" FOREIGN KEY ("id_prioridad") REFERENCES "Prioridad"("id_prioridad") ON DELETE RESTRICT ON UPDATE CASCADE;
