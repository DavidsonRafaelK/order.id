"use client";

// =============================================================================
// src/app/admin/login/page.tsx
// Admin login — Supabase email + password authentication
// No self-registration. Admin account is created in Supabase Auth dashboard.
// =============================================================================

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") ?? "/admin";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(
                    authError.message === "Invalid login credentials"
                        ? "Email atau password salah. Coba lagi."
                        : authError.message
                );
                return;
            }

            router.push(redirectTo);
            router.refresh();
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        PO Galang Dana — Gereja Maria Bunda Karmel
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="admin-email"
                            className="block text-sm font-medium text-foreground"
                        >
                            Email
                        </label>
                        <input
                            id="admin-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@gereja.id"
                            required
                            autoComplete="email"
                            autoFocus
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="admin-password"
                            className="block text-sm font-medium text-foreground"
                        >
                            Password
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                        />
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-xl"
                        >
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-12"
                        disabled={isLoading || !email || !password}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Masuk...
                            </span>
                        ) : (
                            "Masuk"
                        )}
                    </Button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    Akses terbatas untuk admin. Tidak ada registrasi mandiri.
                </p>
            </div>
        </div>
    );
}
