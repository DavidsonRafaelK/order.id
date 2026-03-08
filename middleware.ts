// =============================================================================
// middleware.ts — Next.js Auth Middleware
// Protects all /admin/* routes by checking for a valid Supabase session.
// /admin/login is excluded from protection.
//
// Uses @supabase/ssr createServerClient with cookie read/write access,
// which is required to refresh expired JWT tokens on every request.
// =============================================================================

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Do not run code between createServerClient and supabase.auth.getClaims().
    // A simple mistake could expose user data to attackers.

    // Use getClaims() instead of getUser() — it validates the JWT signature
    // server-side without a network round-trip to the Supabase Auth server.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isAdminRoute = pathname.startsWith("/admin");
    const isLoginPage = pathname === "/admin/login";

    // Allow /admin/login through without auth check
    if (isLoginPage) {
        return supabaseResponse;
    }

    // Protect all /admin/* routes — redirect to /admin/login if not authenticated
    if (isAdminRoute && !user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/admin/login";
        // Preserve the intended destination so we can redirect back after login
        loginUrl.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Return supabaseResponse (not NextResponse.next()) so that cookies are
    // properly forwarded and the session stays alive.
    return supabaseResponse;
}

export const config = {
    matcher: [
        // Run on all /admin routes
        "/admin/:path*",
        // Exclude static files and Next.js internals for performance
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
