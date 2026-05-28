"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { useState, useEffect } from "react";

const getSafeSigninErrorMessage = (error: string, message: string | null) => {
  if (
    error === "server_error" &&
    message?.includes("Unable to exchange external code")
  ) {
    return "לא ניתן היה להשלים את ההתחברות מול Google. נסו להתחבר שוב. אם זה חוזר, יש לבדוק את הגדרות Google OAuth ב-Supabase.";
  }

  return message || "לא ניתן היה להשלים את ההתחברות.";
};

export default function LoginPage() {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const message = searchParams.get("message");
        const callbackError = searchParams.get("error");

        if (callbackError) {
          setAuthError(getSafeSigninErrorMessage(callbackError, message));
          const from = searchParams.get("from");
          const cleanPath = from
            ? `/signin?from=${encodeURIComponent(from)}`
            : "/signin";
          window.history.replaceState(null, "", cleanPath);
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        console.log("Existing session check:", { session, error });

        if (session && !error) {
          console.log("User already authenticated, redirecting...");
          const from = searchParams.get("from") || "/dashboard";
          router.push(from);
          return;
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };

    checkExistingAuth();
  }, [router]);

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsGoogleLoading(true);
    setAuthError(null);

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const from = searchParams.get("from") || "/dashboard";

      // Works for both dev (localhost:3000) and prod (new-path-test.vercel.app)
      const base = window.location.origin; // dev: http://localhost:3000, prod: https://new-path-test.vercel.app
      const redirectTo = `${base}/auth/callback-client?next=${encodeURIComponent(
        from
      )}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Google login error:", error);
        alert("שגיאה בהתחברות עם Google. אנא נסה שוב.");
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert("שגיאה בהתחברות עם Google. אנא נסה שוב.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        alert("שגיאה בהתחברות. אנא בדוק את פרטי ההתחברות שלך.");
      } else {
        console.log("Login successful, session data:", data);
        const searchParams = new URLSearchParams(window.location.search);
        const from = searchParams.get("from") || "/dashboard";
        console.log("Redirecting to:", from);
        setTimeout(() => {
          router.push(from);
        }, 500);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("שגיאה בהתחברות. אנא נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">התחבר לחשבונך</CardTitle>
            <CardDescription>
              הזן את האימייל שלך למטה כדי להתחבר לחשבונך
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <div className="mb-4 rounded-md border border-red-700 bg-red-50 p-3">
                <p className="text-sm text-red-800">{authError}</p>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">אימייל</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">סיסמה</Label>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    שכחת את הסיסמה?
                  </a>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "מתחבר..." : "התחבר"}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      או
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? "מתחבר..." : "התחבר עם Google"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                אין לך חשבון?{" "}
                <Link href="/signup" className="underline underline-offset-4">
                  הירשם
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
