import { defineConfig } from 'drizzle-kit';

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
        // Use the direct/session pooler connection for migrations.
        // This is different from the transaction pooler used at runtime.
        url: process.env.DATABASE_URL_DIRECT!,
    },
});
