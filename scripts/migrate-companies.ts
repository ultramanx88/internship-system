import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCompanies() {
  try {
    console.log('Starting company migration...');

    // Get all internships with unique company names
    const internships = await prisma.internship.findMany({
      select: {
        id: true,
        company: true,
        location: true,
      },
    });

    console.log(`Found ${internships.length} internships`);

    // Get unique company names
    const uniqueCompanies = [...new Set(internships.map(i => i.company))];
    console.log(`Found ${uniqueCompanies.length} unique companies`);

    // Create companies
    for (const companyName of uniqueCompanies) {
      const existingCompany = await prisma.company.findFirst({
        where: { name: companyName },
      });

      if (!existingCompany) {
        // Extract province from location if possible
        const sampleInternship = internships.find(i => i.company === companyName);
        const province = sampleInternship?.location || '';

        await prisma.company.create({
          data: {
            name: companyName,
            province: province,
            isActive: true,
          },
        });
        console.log(`Created company: ${companyName}`);
      }
    }

    // Update internships with companyId
    for (const internship of internships) {
      const company = await prisma.company.findFirst({
        where: { name: internship.company },
      });

      if (company) {
        await prisma.internship.update({
          where: { id: internship.id },
          data: { companyId: company.id },
        });
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCompanies();