#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { roles: { contains: 'student' } },
    select: { id: true, name: true, roles: true },
  });
  if (!user) {
    console.error('No student user found');
    process.exit(2);
  }
  console.log(user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


