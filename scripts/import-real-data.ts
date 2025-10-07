#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseCsv(filePath: string): string[][] {
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0)
    .map((l) => l.split(',').map((x) => x.trim()));
}

async function importCompanies(csvPath: string) {
  const rows = parseCsv(csvPath);
  const [header, ...data] = rows;
  const idx = (k: string) => header.indexOf(k);
  for (const r of data) {
    const id = r[idx('companyId')] || undefined;
    const name = r[idx('name')];
    const email = r[idx('email')] || null;
    const phone = r[idx('phone')] || null;
    if (!name) continue;
    await prisma.company.upsert({
      where: { id: id || 'company_' + Buffer.from(name).toString('base64').slice(0, 10) },
      update: { name, email, phone, isActive: true },
      create: { name, email, phone, isActive: true },
    });
  }
  console.log(`✅ Imported companies: ${data.length}`);
}

async function importInternships(csvPath: string) {
  const rows = parseCsv(csvPath);
  const [header, ...data] = rows;
  const idx = (k: string) => header.indexOf(k);
  for (const r of data) {
    const title = r[idx('title')];
    const companyName = r[idx('companyName')];
    const description = r[idx('description')] || '';
    if (!title || !companyName) continue;
    const company = await prisma.company.findFirst({ where: { name: companyName } });
    if (!company) continue;
    await prisma.internship.upsert({
      where: { id: 'intern_' + Buffer.from(company.id + ':' + title).toString('base64').slice(0, 16) },
      update: { title, companyId: company.id, description, type: 'internship' as any },
      create: { title, companyId: company.id, description, type: 'internship' as any },
    });
  }
  console.log(`✅ Imported internships: ${data.length}`);
}

async function main() {
  const companiesCsv = process.argv[2];
  const internshipsCsv = process.argv[3];
  if (!companiesCsv || !internshipsCsv) {
    console.error('Usage: import-real-data.ts <companies.csv> <internships.csv>');
    process.exit(1);
  }
  await importCompanies(path.resolve(companiesCsv));
  await importInternships(path.resolve(internshipsCsv));
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


