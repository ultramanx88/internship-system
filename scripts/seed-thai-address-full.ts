#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

// DOPA dataset (kongvut) - latest API
type ProvinceAPI = {
  id: number;
  name_th: string;
  name_en: string;
};

type AmphureAPI = {
  id: number;
  province_id: number;
  name_th: string;
  name_en: string;
};

type TambonAPI = {
  id: number;
  district_id: number;
  name_th: string;
  name_en: string;
  zip_code: number | null;
};

const PROVINCES_URL = 'https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province.json';
const AMPHURES_URL = 'https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/district.json';
const TAMBONS_URL = 'https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/sub_district.json';

const prisma = new PrismaClient();

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return (await res.json()) as T;
}

async function main() {
  console.log('🌏 Fetching Thailand administrative datasets...');
  const [provinces, amphures, tambons] = await Promise.all<[
    ProvinceAPI[],
    AmphureAPI[],
    TambonAPI[]
  ]>([
    fetchJson(PROVINCES_URL),
    fetchJson(AMPHURES_URL),
    fetchJson(TAMBONS_URL),
  ]);

  console.log(`📦 Provinces: ${provinces.length}, Amphures: ${amphures.length}, Tambons: ${tambons.length}`);

  // Clean existing address data to avoid duplicates
  console.log('🧹 Clearing existing address data...');
  await prisma.subdistrict.deleteMany({});
  await prisma.district.deleteMany({});
  await prisma.province.deleteMany({});

  console.log('🏁 Seeding provinces...');
  for (const p of provinces) {
    await prisma.province.upsert({
      where: { code: String(p.id) },
      update: {
        nameTh: p.name_th,
        nameEn: p.name_en || null,
        isActive: true,
      },
      create: {
        code: String(p.id),
        nameTh: p.name_th,
        nameEn: p.name_en || null,
        isActive: true,
      },
    });
  }
  console.log('✅ Provinces seeded');

  console.log('🏁 Seeding districts (amphures)...');
  for (const a of amphures) {
    const provinceCode = String(a.province_id);
    const province = await prisma.province.findUnique({ where: { code: provinceCode } });
    if (!province) {
      console.warn(`⚠️  Province not found for district ${a.id} (${a.name_th}), province_id=${a.province_id}`);
      continue;
    }
    await prisma.district.upsert({
      where: { code: String(a.id) },
      update: {
        nameTh: a.name_th,
        nameEn: a.name_en || null,
        provinceId: province.id,
        isActive: true,
      },
      create: {
        code: String(a.id),
        nameTh: a.name_th,
        nameEn: a.name_en || null,
        provinceId: province.id,
        isActive: true,
      },
    });
  }
  console.log('✅ Districts seeded');

  console.log('🏁 Seeding subdistricts (tambons)...');
  let created = 0;
  for (const t of tambons) {
    const districtCode = String(t.district_id);
    const district = await prisma.district.findUnique({ where: { code: districtCode } });
    if (!district) {
      console.warn(`⚠️  District not found for subdistrict ${t.id} (${t.name_th}), district_id=${t.district_id}`);
      continue;
    }
    await prisma.subdistrict.upsert({
      where: { code: String(t.id) },
      update: {
        nameTh: t.name_th,
        nameEn: t.name_en || null,
        postalCode: t.zip_code ? String(t.zip_code) : null,
        districtId: district.id,
        isActive: true,
      },
      create: {
        code: String(t.id),
        nameTh: t.name_th,
        nameEn: t.name_en || null,
        postalCode: t.zip_code ? String(t.zip_code) : null,
        districtId: district.id,
        isActive: true,
      },
    });
    created++;
    if (created % 1000 === 0) {
      console.log(`  ...processed ${created}/${tambons.length}`);
    }
  }
  console.log(`✅ Subdistricts seeded: ${created}`);

  const totals = await prisma.$queryRawUnsafe<{
    provinces: number;
    districts: number;
    subdistricts: number;
  }>(
    `SELECT 
      (SELECT COUNT(*) FROM provinces) AS provinces,
      (SELECT COUNT(*) FROM districts) AS districts,
      (SELECT COUNT(*) FROM subdistricts) AS subdistricts`
  );
  console.log('📊 Totals:', totals[0]);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


