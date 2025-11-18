const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main(){
  const niveles = ['Alta','Media','Baja'];
  for (const nivel of niveles){
    await prisma.prioridad.upsert({
      where: { nivel },
      update: {},
      create: { nivel }
    });
  }

  console.log('✅ Prioridades creadas/aseguradas.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
