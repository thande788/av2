import path from 'node:path';
import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

// Load .env first, then allow .env.local to override for local development.
config({ path: '.env' });
config({ path: '.env.local', override: true });

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
