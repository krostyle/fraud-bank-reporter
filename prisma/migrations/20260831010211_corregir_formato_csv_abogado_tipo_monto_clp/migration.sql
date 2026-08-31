/*
  Warnings:

  - You are about to drop the column `montoTotalReclamadoUf` on the `Caso` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Caso" DROP COLUMN "montoTotalReclamadoUf",
ADD COLUMN     "abogadoAsignado" TEXT,
ADD COLUMN     "fechaCreacionAccionLegal" TIMESTAMP(3),
ADD COLUMN     "montoTotalSuspendidoClp" DECIMAL,
ADD COLUMN     "tipoCaso" TEXT;
