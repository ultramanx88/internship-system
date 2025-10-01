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
      update: {
        name: user.name,
        password: hashedPassword,
        roles: JSON.stringify(user.roles),
        skills: user.skills,
        statement: user.statement,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: hashedPassword,
        roles: JSON.stringify(user.roles),
        skills: user.skills,
        statement: user.statement,
      },
    });
  }
  console.log(`Seeded ${users.length} users.`);

  // Seed Companies first
  const uniqueCompanies = [...new Set(internships.map(i => i.company))];
  for (const companyName of uniqueCompanies) {
    const existingCompany = await prisma.company.findFirst({
      where: { name: companyName },
    });
    
    if (!existingCompany) {
      await prisma.company.create({
        data: {
          name: companyName,
          isActive: true,
        },
      });
    }
  }
  console.log(`Seeded ${uniqueCompanies.length} companies.`);

  // Seed Internships
  for (const internship of internships) {
    const company = await prisma.company.findFirst({
      where: { name: internship.company },
    });
    
    if (company) {
      await prisma.internship.upsert({
          where: { id: internship.id },
          update: {},
          create: {
              id: internship.id,
              title: internship.title,
              companyId: company.id,
              location: internship.location,
              description: internship.description,
              type: internship.type as any,
          }
      });
    }
  }
  console.log(`Seeded ${internships.length} internships.`);

  // Seed Applications
  for (const app of applications) {
     await prisma.application.upsert({
        where: { id: app.id },
        update: {},
        create: {
            id: app.id,
            studentId: app.studentId,
            internshipId: app.internshipId,
            status: app.status as any,
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
