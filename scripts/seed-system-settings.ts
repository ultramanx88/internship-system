import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSystemSettings() {
  try {
    console.log('🌱 Seeding system settings...');

    // Demo users toggle setting
    const demoUsersToggle = await prisma.systemSettings.upsert({
      where: { key: 'demo_users_toggle' },
      update: {},
      create: {
        key: 'demo_users_toggle',
        value: 'false', // Default to false for production
        description: 'Toggle for demo users dropdown visibility in login form',
        category: 'ui',
        isActive: true
      }
    });

    console.log('✅ Demo users toggle setting created:', demoUsersToggle);

    // Add more system settings as needed
    const maintenanceMode = await prisma.systemSettings.upsert({
      where: { key: 'maintenance_mode' },
      update: {},
      create: {
        key: 'maintenance_mode',
        value: 'false',
        description: 'Maintenance mode toggle',
        category: 'system',
        isActive: true
      }
    });

    console.log('✅ Maintenance mode setting created:', maintenanceMode);

    // App version setting
    const appVersion = await prisma.systemSettings.upsert({
      where: { key: 'app_version' },
      update: {},
      create: {
        key: 'app_version',
        value: '1.0.0',
        description: 'Current application version',
        category: 'system',
        isActive: true
      }
    });

    console.log('✅ App version setting created:', appVersion);

    console.log('🎉 System settings seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding system settings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedSystemSettings()
    .then(() => {
      console.log('✅ Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}

export { seedSystemSettings };
