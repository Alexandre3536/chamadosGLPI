import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Forçando o caminho absoluto para o SQLite não dar "Error 14" no seu MacBook
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/alexandredebortoli/Desktop/sistema/neo-glpi/backend/prisma/dev.db',
    },
  },
});

async function main() {
  console.log('🌱 Iniciando o seed do Neo-GLPI...');

  const senhaHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      nome: 'Alexandre Admin',
      senha: senhaHash,
      role: 'ADMIN',
    },
  });

  console.log('--------------------------------------');
  console.log('✅ SUCESSO! Usuário admin criado:');
  console.log(`📧 Email: ${admin.email}`);
  console.log(`👤 Nome: ${admin.nome}`);
  console.log('--------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });