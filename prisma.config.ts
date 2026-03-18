import path from "node:path";
import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Load .env.local for local development
config({ path: ".env.local" });

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),

  migrate: {
    adapter: async () => {
      // Use DIRECT_URL for migrations (non-pooled connection)
      const { PrismaNeon } = await import("@prisma/adapter-neon");
      return new PrismaNeon({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL! });
    },
  },
});
