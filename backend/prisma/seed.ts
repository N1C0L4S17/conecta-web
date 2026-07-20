/**
 * Seed CONECTA URP
 * Carga dimensiones, respuestas (desde seed-data.json generado por el ETL)
 * y usuarios demo para los 3 roles.
 *
 *   npx prisma db seed
 */
import { PrismaClient, Rol } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

type Seed = {
  campanias: { anio: number; nombre: string; activa: boolean }[];
  escuelas: { id: number; nombre: string; facultad: string }[];
  rubros: { id: number; nombre: string }[];
  nivelesCargo: { id: number; nombre: string }[];
  respuestas: any[];
};

async function main() {
  // Idempotencia: si ya hay datos y no se fuerza, solo asegura usuarios demo.
  const yaHayDatos = await prisma.respuestaEncuesta.count();
  if (yaHayDatos > 0 && process.env.FORCE_SEED !== '1') {
    console.log(`Ya existen ${yaHayDatos} respuestas; se omite la recarga (usa FORCE_SEED=1 para forzar).`);
    await asegurarUsuarios();
    console.log('Usuarios demo verificados ✅');
    return;
  }

  const raw = fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf-8');
  const data: Seed = JSON.parse(raw);

  console.log('Limpiando tablas…');
  await prisma.respuestaEncuesta.deleteMany();
  await prisma.escuela.deleteMany();
  await prisma.rubro.deleteMany();
  await prisma.nivelCargo.deleteMany();
  await prisma.campania.deleteMany();

  // Dimensiones (respetamos los IDs del ETL para mapear las FKs)
  const campania = await prisma.campania.create({ data: data.campanias[0] });

  await prisma.escuela.createMany({ data: data.escuelas });
  await prisma.rubro.createMany({ data: data.rubros });
  await prisma.nivelCargo.createMany({ data: data.nivelesCargo });

  console.log(`Insertando ${data.respuestas.length} respuestas…`);
  const rows = data.respuestas.map((r) => ({
    campaniaId: campania.id,
    escuelaId: r.escuelaId ?? null,
    rubroId: r.rubroId ?? null,
    nivelCargoId: r.nivelCargoId ?? null,
    anioEgreso: r.anioEgreso ?? null,
    anioTitulacion: r.anioTitulacion ?? null,
    grado: r.grado ?? null,
    trabajando: !!r.trabajando,
    tieneNegocio: !!r.tieneNegocio,
    tipoEmpleo: r.tipoEmpleo ?? null,
    tipoEmpresa: r.tipoEmpresa ?? null,
    cargoTexto: r.cargoTexto ?? null,
    correspondencia: r.correspondencia ?? null,
    satisfaccion: r.satisfaccion ?? null,
    tiempoPrimerEmpleo: r.tiempoPrimerEmpleo ?? null,
    calidadFormacion: r.calidadFormacion ?? null,
    ubicacion: r.ubicacion ?? null,
  }));
  await prisma.respuestaEncuesta.createMany({ data: rows });

  await asegurarUsuarios();
  console.log('Seed completado ✅');
}

/** Crea (si no existen) los usuarios demo de los 3 roles. */
async function asegurarUsuarios() {
  const pass = await bcrypt.hash('conecta2025', 10);
  const demo = [
    { email: 'admin@urp.edu.pe', nombre: 'Administrador', rol: Rol.ADMIN },
    { email: 'analista@urp.edu.pe', nombre: 'Analista', rol: Rol.ANALISTA },
    { email: 'consulta@urp.edu.pe', nombre: 'Consulta', rol: Rol.CONSULTA },
  ];
    for (const u of demo) {
      await prisma.usuario.upsert({
      where: { email: u.email },

      update: {
        nombre: u.nombre,
        rol: u.rol,
        passwordHash: pass,
        activo: true,
      },

      create: {
        ...u,
        passwordHash: pass,
        activo: true,
      },
    });
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
