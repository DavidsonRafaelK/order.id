// =============================================================================
// src/lib/supabase/client.ts
// Browser (client-side) Supabase client.
//
// Used for:
// - Supabase Realtime subscriptions in Client Components (NW-02 admin dashboard)
// - Any browser-side Supabase operations
//
// Uses NEXT_PUBLIC_ keys which are safe to expose to the browser.
// Do NOT use this file for admin operations — use admin.ts instead.
// =============================================================================

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
