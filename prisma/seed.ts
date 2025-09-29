import { PrismaClient, Role } from '@prisma/client';
import { users as demoUsers } from '../src/lib/data';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  for (const user of demoUsers) {
    // Prisma's enums are uppercase, while our mock data is lowercase.
    const userRoles = user.roles.map(role => role.toUpperCase() as Role);

    const hashedPassword = await bcrypt.hash(user.password || '123456', 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: hashedPassword,
        roles: userRoles,
        skills: user.skills,
        statement: user.statement,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });