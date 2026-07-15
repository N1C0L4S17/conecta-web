-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'ANALISTA', 'CONSULTA');

-- CreateEnum
CREATE TYPE "TipoEmpleo" AS ENUM ('PRIVADA', 'PUBLICA');

-- CreateEnum
CREATE TYPE "Correspondencia" AS ENUM ('TOTALMENTE', 'MUCHO', 'POCO', 'NADA');

-- CreateEnum
CREATE TYPE "TiempoEmpleo" AS ENUM ('MENOS_3M', 'ENTRE_3_6M', 'ENTRE_6_12M', 'ENTRE_1_2A', 'MAS_2A');

-- CreateTable
CREATE TABLE "Campania" (
    "id" SERIAL NOT NULL,
    "anio" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campania_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Escuela" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "facultad" TEXT NOT NULL,

    CONSTRAINT "Escuela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rubro" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Rubro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NivelCargo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "NivelCargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespuestaEncuesta" (
    "id" SERIAL NOT NULL,
    "campaniaId" INTEGER NOT NULL,
    "escuelaId" INTEGER,
    "rubroId" INTEGER,
    "nivelCargoId" INTEGER,
    "anioEgreso" INTEGER,
    "anioTitulacion" INTEGER,
    "grado" TEXT,
    "trabajando" BOOLEAN NOT NULL DEFAULT false,
    "tieneNegocio" BOOLEAN NOT NULL DEFAULT false,
    "tipoEmpleo" "TipoEmpleo",
    "tipoEmpresa" "TipoEmpleo",
    "cargoTexto" TEXT,
    "correspondencia" "Correspondencia",
    "satisfaccion" INTEGER,
    "tiempoPrimerEmpleo" "TiempoEmpleo",
    "calidadFormacion" INTEGER,
    "ubicacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RespuestaEncuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'CONSULTA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campania_anio_key" ON "Campania"("anio");

-- CreateIndex
CREATE UNIQUE INDEX "Escuela_nombre_key" ON "Escuela"("nombre");

-- CreateIndex
CREATE INDEX "Escuela_facultad_idx" ON "Escuela"("facultad");

-- CreateIndex
CREATE UNIQUE INDEX "Rubro_nombre_key" ON "Rubro"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "NivelCargo_nombre_key" ON "NivelCargo"("nombre");

-- CreateIndex
CREATE INDEX "RespuestaEncuesta_campaniaId_idx" ON "RespuestaEncuesta"("campaniaId");

-- CreateIndex
CREATE INDEX "RespuestaEncuesta_escuelaId_idx" ON "RespuestaEncuesta"("escuelaId");

-- CreateIndex
CREATE INDEX "RespuestaEncuesta_rubroId_idx" ON "RespuestaEncuesta"("rubroId");

-- CreateIndex
CREATE INDEX "RespuestaEncuesta_anioEgreso_idx" ON "RespuestaEncuesta"("anioEgreso");

-- CreateIndex
CREATE INDEX "RespuestaEncuesta_trabajando_idx" ON "RespuestaEncuesta"("trabajando");

-- CreateIndex
CREATE INDEX "RespuestaEncuesta_tieneNegocio_idx" ON "RespuestaEncuesta"("tieneNegocio");

-- CreateIndex
CREATE INDEX "RespuestaEncuesta_tipoEmpleo_idx" ON "RespuestaEncuesta"("tipoEmpleo");

-- CreateIndex
CREATE INDEX "RespuestaEncuesta_tipoEmpresa_idx" ON "RespuestaEncuesta"("tipoEmpresa");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "RespuestaEncuesta" ADD CONSTRAINT "RespuestaEncuesta_campaniaId_fkey" FOREIGN KEY ("campaniaId") REFERENCES "Campania"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaEncuesta" ADD CONSTRAINT "RespuestaEncuesta_escuelaId_fkey" FOREIGN KEY ("escuelaId") REFERENCES "Escuela"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaEncuesta" ADD CONSTRAINT "RespuestaEncuesta_rubroId_fkey" FOREIGN KEY ("rubroId") REFERENCES "Rubro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaEncuesta" ADD CONSTRAINT "RespuestaEncuesta_nivelCargoId_fkey" FOREIGN KEY ("nivelCargoId") REFERENCES "NivelCargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
