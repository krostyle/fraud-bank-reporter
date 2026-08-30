import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { REGIONES_OFICIALES } from "@/lib/casos/regiones-comunas-oficial";

async function main() {
  for (const region of REGIONES_OFICIALES) {
    const regionRow = await prisma.region.upsert({
      where: { nombre: region.nombre },
      create: { nombre: region.nombre, aliases: region.aliases },
      update: { aliases: region.aliases },
    });

    for (const comuna of region.comunas) {
      await prisma.comuna.upsert({
        where: { regionId_nombre: { regionId: regionRow.id, nombre: comuna } },
        create: { nombre: comuna, regionId: regionRow.id },
        update: {},
      });
    }
  }

  const totalRegiones = await prisma.region.count();
  const totalComunas = await prisma.comuna.count();
  console.log(`Catálogo oficial sembrado: ${totalRegiones} regiones, ${totalComunas} comunas.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
