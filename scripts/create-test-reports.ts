import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestReports() {
  try {
    console.log('Creating test reports...');
    console.log('Note: Report model does not exist in current schema');
    console.log('This script is disabled until report model is added to schema');

    // Since report model doesn't exist, just log a message
    console.log('Test reports creation skipped - report model not available');
  } catch (error) {
    console.error('Error creating test reports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestReports();