import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHolidays() {
  try {
    console.log('Seeding holidays...');

    const holidays = [
      {
        name: 'วันขึ้นปีใหม่',
        nameEn: 'New Year\'s Day',
        date: new Date('2025-01-01'),
        isActive: true,
      },
      {
        name: 'วันสงกรานต์',
        nameEn: 'Songkran Day',
        date: new Date('2025-04-14'),
        isActive: true,
      },
      {
        name: 'วันแรงงาน',
        nameEn: 'Labour Day',
        date: new Date('2025-05-01'),
        isActive: true,
      },
      {
        name: 'วันวิสาขบูชา',
        nameEn: 'Visakha Bucha Day',
        date: new Date('2025-05-12'),
        isActive: true,
      },
      {
        name: 'วันเฉลิมพระชนมพรรษา',
        nameEn: 'King\'s Birthday',
        date: new Date('2025-07-28'),
        isActive: true,
      },
      {
        name: 'วันแม่แห่งชาติ',
        nameEn: 'Mother\'s Day',
        date: new Date('2025-08-12'),
        isActive: true,
      },
      {
        name: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสิริกิติ์',
        nameEn: 'Queen\'s Birthday',
        date: new Date('2025-08-12'),
        isActive: true,
      },
      {
        name: 'วันปิยมหาราช',
        nameEn: 'Chulalongkorn Day',
        date: new Date('2025-10-23'),
        isActive: true,
      },
      {
        name: 'วันพ่อแห่งชาติ',
        nameEn: 'Father\'s Day',
        date: new Date('2025-12-05'),
        isActive: true,
      },
      {
        name: 'วันรัฐธรรมนูญ',
        nameEn: 'Constitution Day',
        date: new Date('2025-12-10'),
        isActive: true,
      },
    ];

    // Clear existing holidays first
    await prisma.holiday.deleteMany({});

    // Create new holidays
    for (const holiday of holidays) {
      await prisma.holiday.create({
        data: holiday,
      });
    }

    console.log('Holidays seeded successfully!');
  } catch (error) {
    console.error('Error seeding holidays:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedHolidays();
