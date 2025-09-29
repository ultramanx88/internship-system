import { PrismaClient } from '@prisma/client';
import { users, internships, applications } from '../src/lib/data';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Seed Users
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password || '123456', 10);
    
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: hashedPassword,
        roles: user.roles,
        skills: user.skills,
        statement: user.statement,
      },
    });
  }
  console.log(`Seeded ${users.length} users.`);

  // Seed Internships
  for (const internship of internships) {
    await prisma.internship.upsert({
        where: { id: internship.id },
        update: {},
        create: {
            id: internship.id,
            title: internship.title,
            company: internship.company,
            location: internship.location,
            description: internship.description,
            type: internship.type,
        }
    })
  }
  console.log(`Seeded ${internships.length} internships.`);

  // Seed Applications
  for (const app of applications) {
     await prisma.application.create({
        data: {
            id: app.id,
            studentId: app.studentId,
            internshipId: app.internshipId,
            status: app.status,
            dateApplied: new Date(app.dateApplied),
            feedback: app.feedback,
            projectTopic: app.projectTopic,
        }
     })
  }
  console.log(`Seeded ${applications.length} applications.`);

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