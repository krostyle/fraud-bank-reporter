-- AlterTable
ALTER TABLE "Region" ADD COLUMN     "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[];
