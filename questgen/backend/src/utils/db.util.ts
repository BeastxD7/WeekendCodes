import { PrismaClient } from '@prisma/client';

/**
 * Singleton PrismaClient instance
 */
let prisma: PrismaClient;

/**
 * Get the PrismaClient instance
 * @returns PrismaClient instance
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

/**
 * Connect to the database
 */
export async function connectDB(): Promise<void> {
  try {
    const client = getPrismaClient();
    await client.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

/**
 * Disconnect from the database
 */
export async function disconnectDB(): Promise<void> {
  try {
    await prisma?.$disconnect();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Database disconnection error:', error);
  }
}