/*
 * src/lib/supabase/server.ts
 * Server-side Supabase client (Server Components, Server Actions, Route Handlers).
 *
 * Uses cookie-based session management via @supabase/ssr so that auth state
 * is available across the entire Next.js server stack. Must be called inside
 * a request context where Next.js cookies() is available.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        /*
                         * setAll called from a Server Component — cookies can only be
                         * written from middleware or Server Actions. Safe to ignore here
                         * as the middleware handles session refresh.
                         */
                    }
                },
            },
        }
    );
}
