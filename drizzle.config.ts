import { defineConfig } from 'drizzle-kit';

/*
 * drizzle.config.ts
 * Drizzle Kit config — points to the schema and outputs migrations.
 * Uses DATABASE_URL_DIRECT (session pooler, port 5432) for migrations,
 * which is different from the transaction pooler used at app runtime.
 */

if (!process.env.DATABASE_URL_DIRECT) {
    throw new Error(
        'DATABASE_URL_DIRECT is required for running migrations.\n' +
        'Use the Supabase "Session pooler" (port 5432) or direct connection string.'
    );
}

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/db/schema.ts',
    out: './src/db/migrations',
    dbCredentials: {
        url: process.env.DATABASE_URL_DIRECT!,
    },
});
