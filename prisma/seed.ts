import { PrismaClient } from '@prisma/client';
import { users as mockUsers, internships, applications } from '../src/lib/data';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Seed Users
  for (const user of mockUsers) {
    const hashedPassword = await bcrypt.hash(user.password || '123456', 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: hashedPassword,
        roles: user.roles,
        skills: user.skills,
        statement: user.statement,
      },
    });
  }

  // Seed Internships
  for (const internship of internships) {
    await prisma.internship.upsert({
      where: { id: internship.id },
      update: {},
      create: internship,
    });
  }

  // Seed Applications
  for (const application of applications) {
     // Ensure the user and internship exist before creating the application
    const student = await prisma.user.findUnique({ where: { id: application.studentId } });
    const internship = await prisma.internship.findUnique({ where: { id: application.internshipId } });

    if (student && internship) {
        await prisma.application.upsert({
            where: { id: application.id },
            update: {},
            create: {
                id: application.id,
                status: application.status,
                dateApplied: new Date(application.dateApplied),
                feedback: application.feedback,
                student: {
                    connect: { id: application.studentId },
                },
                internship: {
                    connect: { id: application.internshipId },
                },
            },
        });
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
