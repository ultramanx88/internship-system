#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const summary: any = { timestamp: new Date().toISOString(), checks: {} };

  // Users health
  const usersMissing = await prisma.user.findMany({
    where: {
      OR: [
        { name: { equals: '' } },
        { email: { equals: '' } },
        { phone: { equals: '' } },
        { phone: { equals: null } },
      ],
    },
    select: { id: true, name: true, email: true, phone: true },
    take: 50,
  });
  summary.checks.usersMissingCoreFields = { count: usersMissing.length, sample: usersMissing };

  // Companies health
  const companiesMissing = await prisma.company.findMany({
    where: { OR: [{ name: { equals: '' } }] },
    select: { id: true, name: true },
    take: 50,
  });
  summary.checks.companiesMissingName = { count: companiesMissing.length, sample: companiesMissing };

  // Internships health: detect orphaned company references (without null filtering)
  const internshipsSample = await prisma.internship.findMany({
    select: { id: true, title: true, companyId: true },
    take: 500,
  });
  let orphanInternships = 0;
  const orphanSample: { id: string; title: string | null; companyId: string | null }[] = [];
  for (const it of internshipsSample) {
    if (!it.companyId) {
      orphanInternships++;
      if (orphanSample.length < 50) orphanSample.push(it);
      continue;
    }
    const company = await prisma.company.findUnique({ where: { id: it.companyId }, select: { id: true } });
    if (!company) {
      orphanInternships++;
      if (orphanSample.length < 50) orphanSample.push(it);
    }
  }
  summary.checks.internshipsMissingCompany = { count: orphanInternships, sample: orphanSample };

  // Applications FK
  const applications = await prisma.application.findMany({ select: { id: true, studentId: true, internshipId: true }, take: 1000 });
  let orphanApplications = 0;
  for (const app of applications) {
    const [user, internship] = await Promise.all([
      prisma.user.findUnique({ where: { id: app.studentId }, select: { id: true } }),
      prisma.internship.findUnique({ where: { id: app.internshipId }, select: { id: true } }),
    ]);
    if (!user || !internship) orphanApplications++;
  }
  summary.checks.orphanApplications = { count: orphanApplications };

  // Address linkage
  const usersMissingAddressLinks = await prisma.user.findMany({
    where: { OR: [{ facultyId: null }, { majorId: null }] },
    select: { id: true, name: true, facultyId: true, majorId: true },
    take: 50,
  });
  summary.checks.usersMissingFacultyOrMajor = { count: usersMissingAddressLinks.length, sample: usersMissingAddressLinks };

  // Save report
  const outDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `data-health-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`);
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2));
  console.log('✅ Data health report saved:', outFile);
}

main()
  .catch((e) => {
    console.error('❌ Health check failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


