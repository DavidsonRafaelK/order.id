// =============================================================================
// src/db/index.ts
// Drizzle ORM database client — singleton instance for server-side use.
//
// Uses the Supabase Transaction Pooler (port 6543) for all queries.
// `prepare: false` is required because the Transaction pooler does not
// support PostgreSQL prepared statements.
//
// NOTE: Supabase Realtime subscriptions are handled separately using the
// Supabase JS client with the anon key. That setup lives in
// src/lib/supabase/client.ts and is used in NW-02 (admin dashboard).
// Drizzle only handles direct DB reads/writes — Realtime is over websockets.
// =============================================================================

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Startup guard — fail fast with a clear message rather than a cryptic
// connection error at runtime. The app must NOT start without a DB connection.
if (!process.env.DATABASE_URL) {
    throw new Error(
        "[po-lektor] Missing required environment variable: DATABASE_URL\n" +
        "Copy .env.example to .env.local and fill in your Supabase credentials."
    );
}

// Transaction pooler connection — prepare: false is required for Supabase
// pgBouncer in transaction mode.
const client = postgres(process.env.DATABASE_URL, { prepare: false });

export const db = drizzle({ client, schema });
