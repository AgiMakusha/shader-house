import { PrismaClient } from '@prisma/client';

// PrismaClient singleton to avoid multiple instances in development
// See: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * PERFORMANCE FIX: Database Connection Pooling Configuration
 * 
 * Connection pooling settings are configured in the DATABASE_URL via query parameters:
 * - connection_limit: Maximum number of database connections (default: 10)
 * - pool_timeout: Max time to wait for a connection in seconds (default: 10)
 * - connect_timeout: Max time to establish a connection in seconds (default: 5)
 * 
 * Example DATABASE_URL format:
 * postgresql://user:password@host:5432/database?connection_limit=10&pool_timeout=10&connect_timeout=5
 * 
 * For production with high traffic, consider using PgBouncer as a connection pooler:
 * https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#external-connection-poolers
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // PERFORMANCE FIX: Only log errors to avoid terminal spam and slowdowns
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
    // Connection management happens at the database URL level
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown: close database connections when the process terminates
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

