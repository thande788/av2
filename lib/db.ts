/**
 * Prisma Database Client with Neon Serverless Adapter
 * 
 * Uses the Neon serverless driver for optimal performance on Vercel.
 * Singleton pattern prevents connection exhaustion in serverless environments.
 * 
 * @see https://www.prisma.io/docs/orm/overview/databases/neon#how-to-connect-using-the-neon-serverless-driver
 */

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export default db;
