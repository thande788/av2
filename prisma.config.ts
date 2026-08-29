import path from 'node:path';
import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

const prismaEnvFile = process.env.PRISMA_ENV_FILE;

if (prismaEnvFile) {
  // Explicit env file for Prisma commands, e.g. PRISMA_ENV_FILE=.env.production
  config({ path: prismaEnvFile, override: true });
} else {
  // Default local behavior: load .env, then allow .env.local overrides.
  config({ path: '.env' });
  config({ path: '.env.local', override: true });
}

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),

  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },

  datasource: {
    // Use DIRECT_URL for migrations if available, otherwise DATABASE_URL
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
