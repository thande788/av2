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
import {
  transformPrismaResult,
  transformPrismaWhereArgs,
  transformPrismaWriteArgs,
} from "@/lib/pii";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });

  const client = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, operation, query }) {
          if (
            operation === "findUnique" ||
            operation === "findUniqueOrThrow" ||
            operation === "findFirst" ||
            operation === "findFirstOrThrow" ||
            operation === "findMany" ||
            operation === "update" ||
            operation === "updateMany" ||
            operation === "upsert" ||
            operation === "delete" ||
            operation === "deleteMany"
          ) {
            transformPrismaWhereArgs(args);
          }

          if (
            operation === "create" ||
            operation === "createMany" ||
            operation === "update" ||
            operation === "updateMany" ||
            operation === "upsert"
          ) {
            transformPrismaWriteArgs(args);
          }

          const result = await query(args);
          transformPrismaResult(result);
          return result;
        },
      },
    },
  }) as unknown as PrismaClient;
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export default db;
