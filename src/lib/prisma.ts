import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  console.log('🔧 Creating Prisma Client...');
  console.log('🔧 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
  
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    errorFormat: 'pretty',
  });
};

const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Test connection on startup (only in development)
if (process.env.NODE_ENV === 'development') {
  prisma.$connect()
    .then(() => {
      console.log('✅ Prisma Client connected successfully');
    })
    .catch((error) => {
      console.error('❌ Prisma Client connection failed:', error);
    });
}

export default prisma;
export { prisma };
