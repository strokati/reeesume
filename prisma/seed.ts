import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  // Ensure local-user exists
  await db.user.upsert({
    where: { id: 'local-user' },
    update: {},
    create: { id: 'local-user', email: 'local@localhost' },
  });

  // Update existing resume to have proper defaults
  const existing = await db.masterResume.findFirst({ where: { userId: 'local-user' } });
  if (existing) {
    await db.masterResume.update({
      where: { id: existing.id },
      data: { name: 'International', language: 'en', isDefault: true },
    });
  } else {
    await db.masterResume.create({
      data: { userId: 'local-user', name: 'International', language: 'en', isDefault: true },
    });
  }

  // Create German Market resume if it doesn't exist
  const german = await db.masterResume.findFirst({
    where: { userId: 'local-user', name: 'German Market' },
  });
  if (!german) {
    await db.masterResume.create({
      data: { userId: 'local-user', name: 'German Market', language: 'de', isDefault: false },
    });
  }

  const count = await db.masterResume.count({ where: { userId: 'local-user' } });
  console.log(`Seed: local-user now has ${count} master resume(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
