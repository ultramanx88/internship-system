import { PrismaClient } from '@prisma/client';
import { users, internships, applications } from '../src/lib/data';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Seed Users
  for (const user of users) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    
    if (existingUser) {
      console.log(`User with email ${user.email} already exists. Skipping.`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(user.password || '123456', 10);
    await prisma.user.create({
      data: {
        id: user.id, // Using the ID from mock data
        email: user.email,
        name: user.name,
        password: hashedPassword,
        roles: user.roles,
        skills: user.skills,
        statement: user.statement,
      },
    });
  }
  console.log('Users seeded.');

  // Seed Internships
  for (const internship of internships) {
     const existingInternship = await prisma.internship.findUnique({
      where: { id: internship.id },
    });
    if (existingInternship) {
      console.log(`Internship with id ${internship.id} already exists. Skipping.`);
      continue;
    }
    await prisma.internship.create({
      data: internship,
    });
  }
  console.log('Internships seeded.');

  // Seed Applications
  for (const application of applications) {
    const existingApplication = await prisma.application.findUnique({
        where: { id: application.id }
    });
    if (existingApplication) {
        console.log(`Application with id ${application.id} already exists. Skipping.`);
        continue;
    }

    // Ensure the user and internship exist before creating the application
    const student = await prisma.user.findUnique({ where: { id: application.studentId } });
    const internship = await prisma.internship.findUnique({ where: { id: application.internshipId } });

    if (student && internship) {
        await prisma.application.create({
            data: {
                id: application.id,
                status: application.status,
                dateApplied: new Date(application.dateApplied),
                feedback: application.feedback,
                projectTopic: application.projectTopic,
                student: {
                    connect: { id: application.studentId },
                },
                internship: {
                    connect: { id: application.internshipId },
                },
            },
        });
    } else {
        console.warn(`Skipping application for student ${application.studentId} and internship ${application.internshipId} because one or both do not exist.`);
    }
  }
  console.log('Applications seeded.');


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
