#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

// Ensure DATABASE_URL is valid for Prisma runtime
if (!process.env.DATABASE_URL || !/^postgres(ql)?:\/\//.test(process.env.DATABASE_URL)) {
  // Prefer a sensible local default if missing/invalid
  process.env.DATABASE_URL =
    'postgresql://postgres:password@localhost:5432/internship_system_dev?schema=public';
}

const prisma = new PrismaClient();

function normalizeEmail(email?: string | null) {
  if (!email) return null;
  return email.trim().toLowerCase();
}

function normalizePhone(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return digits || null;
}

async function main() {
  // Normalize users
  const users = await prisma.user.findMany({ select: { id: true, email: true, phone: true, name: true } });
  for (const u of users) {
    const email = normalizeEmail(u.email);
    const phone = normalizePhone(u.phone);
    await prisma.user.update({ where: { id: u.id }, data: { email, phone } });
  }
  console.log(`✅ Normalized users: ${users.length}`);

  // Ensure companies active flag
  await prisma.company.updateMany({ data: { isActive: true } });
  console.log('✅ Companies set active');

  // Backfill missing English names for address data (report only if nothing to fill)
  const [provMissing, distMissing, subMissing] = await Promise.all([
    prisma.province.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
    prisma.district.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
    prisma.subdistrict.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
  ]);
  console.log(`ℹ️ Address EN names missing → provinces:${provMissing}, districts:${distMissing}, subdistricts:${subMissing}`);

  // Report EN coverage across academic structures and companies/internships
  const [
    facultiesMissingEn,
    departmentsMissingEn,
    curriculumsMissingEn,
    majorsMissingEn,
    companiesMissingNameEn,
    companiesMissingDescEn,
    companiesMissingIndustryEn,
    companiesMissingAddressEn,
    internshipsMissingTitleEn,
    internshipsMissingDescEn,
    yearsMissingEn,
    semestersMissingEn,
  ] = await Promise.all([
    prisma.faculty.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
    prisma.department.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
    prisma.curriculum.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
    prisma.major.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
    prisma.company.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
    prisma.company.count({ where: { OR: [{ descriptionEn: null }, { descriptionEn: '' }] } }),
    prisma.company.count({ where: { OR: [{ industryEn: null }, { industryEn: '' }] } }),
    prisma.company.count({ where: { OR: [{ addressEn: null }, { addressEn: '' }] } }),
    prisma.internship.count({ where: { OR: [{ titleEn: null }, { titleEn: '' }] } }),
    prisma.internship.count({ where: { OR: [{ descriptionEn: null }, { descriptionEn: '' }] } }),
    prisma.academicYear.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
    prisma.semester.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
  ]);
  console.log(
    `ℹ️ EN coverage → faculties:${facultiesMissingEn}, departments:${departmentsMissingEn}, curriculums:${curriculumsMissingEn}, majors:${majorsMissingEn}, companies.nameEn:${companiesMissingNameEn}, companies.descriptionEn:${companiesMissingDescEn}, companies.industryEn:${companiesMissingIndustryEn}, companies.addressEn:${companiesMissingAddressEn}, internships.titleEn:${internshipsMissingTitleEn}, internships.descriptionEn:${internshipsMissingDescEn}, years.nameEn:${yearsMissingEn}, semesters.nameEn:${semestersMissingEn}`
  );

  // Backfill missing EN fields by copying TH fields where appropriate
  // Faculties
  if (facultiesMissingEn > 0) {
    const rows = await prisma.faculty.findMany({
      where: { OR: [{ nameEn: null }, { nameEn: '' }] },
      select: { id: true, nameTh: true },
    });
    for (const r of rows) {
      await prisma.faculty.update({ where: { id: r.id }, data: { nameEn: r.nameTh } });
    }
    console.log(`✅ Backfilled faculties.nameEn: ${rows.length}`);
  }

  // Departments
  if (departmentsMissingEn > 0) {
    const rows = await prisma.department.findMany({
      where: { OR: [{ nameEn: null }, { nameEn: '' }] },
      select: { id: true, nameTh: true },
    });
    for (const r of rows) {
      await prisma.department.update({ where: { id: r.id }, data: { nameEn: r.nameTh } });
    }
    console.log(`✅ Backfilled departments.nameEn: ${rows.length}`);
  }

  // Curriculums
  if (curriculumsMissingEn > 0) {
    const rows = await prisma.curriculum.findMany({
      where: { OR: [{ nameEn: null }, { nameEn: '' }] },
      select: { id: true, nameTh: true },
    });
    for (const r of rows) {
      await prisma.curriculum.update({ where: { id: r.id }, data: { nameEn: r.nameTh } });
    }
    console.log(`✅ Backfilled curriculums.nameEn: ${rows.length}`);
  }

  // Majors
  if (majorsMissingEn > 0) {
    const rows = await prisma.major.findMany({
      where: { OR: [{ nameEn: null }, { nameEn: '' }] },
      select: { id: true, nameTh: true },
    });
    for (const r of rows) {
      await prisma.major.update({ where: { id: r.id }, data: { nameEn: r.nameTh } });
    }
    console.log(`✅ Backfilled majors.nameEn: ${rows.length}`);
  }

  // Companies
  if (companiesMissingNameEn + companiesMissingDescEn + companiesMissingIndustryEn + companiesMissingAddressEn > 0) {
    const rows = await prisma.company.findMany({
      where: {
        OR: [
          { nameEn: null }, { nameEn: '' },
          { descriptionEn: null }, { descriptionEn: '' },
          { industryEn: null }, { industryEn: '' },
          { addressEn: null }, { addressEn: '' },
        ],
      },
      select: { id: true, name: true, description: true, industry: true, address: true },
    });
    let updated = 0;
    for (const r of rows) {
      const data: any = {};
      if (r.name) data.nameEn = r.name;
      if (r.description) data.descriptionEn = r.description;
      if (r.industry) data.industryEn = r.industry;
      if (r.address) data.addressEn = r.address;
      if (Object.keys(data).length > 0) {
        await prisma.company.update({ where: { id: r.id }, data });
        updated++;
      }
    }
    console.log(`✅ Backfilled companies EN fields: ${updated}`);
  }

  // Internships
  if (internshipsMissingTitleEn + internshipsMissingDescEn > 0) {
    const rows = await prisma.internship.findMany({
      where: {
        OR: [
          { titleEn: null }, { titleEn: '' },
          { descriptionEn: null }, { descriptionEn: '' },
        ],
      },
      select: { id: true, title: true, description: true },
    });
    let updated = 0;
    for (const r of rows) {
      const data: any = {};
      if (r.title) data.titleEn = r.title;
      if (r.description) data.descriptionEn = r.description;
      if (Object.keys(data).length > 0) {
        await prisma.internship.update({ where: { id: r.id }, data });
        updated++;
      }
    }
    console.log(`✅ Backfilled internships EN fields: ${updated}`);
  }

  // AcademicYear
  if (yearsMissingEn > 0) {
    const rows = await prisma.academicYear.findMany({
      where: { OR: [{ nameEn: null }, { nameEn: '' }] },
      select: { id: true, name: true },
    });
    for (const r of rows) {
      await prisma.academicYear.update({ where: { id: r.id }, data: { nameEn: r.name } });
    }
    console.log(`✅ Backfilled academicYears.nameEn: ${rows.length}`);
  }

  // Semester
  if (semestersMissingEn > 0) {
    const rows = await prisma.semester.findMany({
      where: { OR: [{ nameEn: null }, { nameEn: '' }] },
      select: { id: true, name: true },
    });
    for (const r of rows) {
      await prisma.semester.update({ where: { id: r.id }, data: { nameEn: r.name } });
    }
    console.log(`✅ Backfilled semesters.nameEn: ${rows.length}`);
  }

  // Recount after backfill
  const [
    facultiesMissingEn2,
    departmentsMissingEn2,
    curriculumsMissingEn2,
    majorsMissingEn2,
    companiesMissingNameEn2,
    companiesMissingDescEn2,
    companiesMissingIndustryEn2,
    companiesMissingAddressEn2,
    internshipsMissingTitleEn2,
    internshipsMissingDescEn2,
    yearsMissingEn2,
    semestersMissingEn2,
  ] = await Promise.all([
    prisma.faculty.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
    prisma.department.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
    prisma.curriculum.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
    prisma.major.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
    prisma.company.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
    prisma.company.count({ where: { OR: [{ descriptionEn: null }, { descriptionEn: '' }] } }),
    prisma.company.count({ where: { OR: [{ industryEn: null }, { industryEn: '' }] } }),
    prisma.company.count({ where: { OR: [{ addressEn: null }, { addressEn: '' }] } }),
    prisma.internship.count({ where: { OR: [{ titleEn: null }, { titleEn: '' }] } }),
    prisma.internship.count({ where: { OR: [{ descriptionEn: null }, { descriptionEn: '' }] } }),
    prisma.academicYear.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
    prisma.semester.count({ where: { OR: [{ nameEn: null }, { nameEn: '' }] } }),
  ]);
  console.log(
    `✅ EN coverage after backfill → faculties:${facultiesMissingEn2}, departments:${departmentsMissingEn2}, curriculums:${curriculumsMissingEn2}, majors:${majorsMissingEn2}, companies.nameEn:${companiesMissingNameEn2}, companies.descriptionEn:${companiesMissingDescEn2}, companies.industryEn:${companiesMissingIndustryEn2}, companies.addressEn:${companiesMissingAddressEn2}, internships.titleEn:${internshipsMissingTitleEn2}, internships.descriptionEn:${internshipsMissingDescEn2}, years.nameEn:${yearsMissingEn2}, semesters.nameEn:${semestersMissingEn2}`
  );
}

main()
  .catch((e) => {
    console.error('❌ Normalize failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


