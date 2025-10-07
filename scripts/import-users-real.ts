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

async function main() {
  const csv = process.argv[2];
  if (!csv) {
    console.error('Usage: import-users-real.ts <users.csv>');
    process.exit(1);
  }
  const rows = parseCsv(path.resolve(csv));
  const [header, ...data] = rows;
  const idx = (k: string) => header.indexOf(k);

  let imported = 0;
  for (const r of data) {
    const id = r[idx('id')];
    const name = r[idx('name')];
    const email = r[idx('email')];
    const phone = r[idx('phone')] || null;
    const rolesRaw = r[idx('roles')] || '[]';
    if (!id || !name || !email) continue;
    await prisma.user.upsert({
      where: { id },
      update: { name, email: email.toLowerCase().trim(), phone },
      create: { id, name, email: email.toLowerCase().trim(), password: '', roles: rolesRaw },
    });
    imported++;
  }
  console.log(`✅ Imported/Updated users: ${imported}`);
}

main()
  .catch((e) => {
    console.error('❌ Import users failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


