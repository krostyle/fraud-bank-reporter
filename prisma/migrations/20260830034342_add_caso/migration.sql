-- CreateTable
CREATE TABLE "Caso" (
    "ot" TEXT NOT NULL,
    "rut" TEXT,
    "nombreContacto" TEXT,
    "subStatus" TEXT,
    "fechaEnvioFiscalia" TIMESTAMP(3),
    "fechaPresentacion" TIMESTAMP(3),
    "anioPresentacion" TEXT,
    "rol" TEXT,
    "fechaResolucionTribunal" TIMESTAMP(3),
    "fechaNotificacionResolucionTribunal" TIMESTAMP(3),
    "resolucionTribunal" TEXT,
    "numeroTribunal" TEXT,
    "tribunal" TEXT,
    "localidadComunaRegion" TEXT,
    "propietarioCaso" TEXT,
    "montoTotalReclamadoUf" DECIMAL,
    "ultimaModificacionPor" TEXT,
    "estadoAccionLegal" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Caso_pkey" PRIMARY KEY ("ot")
);
