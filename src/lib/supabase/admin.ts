/*
 * src/lib/supabase/admin.ts
 * Service-role Supabase client — PRIVILEGED, bypasses Row Level Security.
 *
 * ⚠️  NEVER import this file in Client Components or expose to the browser.
 * ⚠️  Only use in Server Actions or protected API routes.
 *
 * Used for admin operations that must bypass RLS policies.
 */

import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
        "[po-lektor] Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY"
    );
}

export const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);
