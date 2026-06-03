"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import supabase from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const handleGoogleSignup = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptedTerms || !acceptedPrivacy) {
      setError("יש לאשר את תנאי השימוש ומדיניות הפרטיות לפני ההרשמה");
      return;
    }

    setIsLoading(true);

    try {
      const base = window.location.origin;
      const redirectTo = `${base}/auth/callback-client?next=${encodeURIComponent(
        "/dashboard"
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

      if (error) throw error;

      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (error: any) {
      console.error("Google signup error:", error);
      setError(error.message || "שגיאה בהרשמה עם Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;
    const termsAccepted = formData.get("terms") === "on";
    const privacyAccepted = formData.get("privacy") === "on";

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("אנא מלא את כל השדות");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      setIsLoading(false);
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      setError("יש לאשר את תנאי השימוש ומדיניות הפרטיות לפני ההרשמה");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback-client`,
        },
      });

      if (error) throw error;

      if (data.user && !data.user.email_confirmed_at) {
        setSuccess(true);
      } else {
        // User is confirmed, redirect to dashboard or home
        router.push("/");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || "שגיאה בהרשמה");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-semibold leading-none tracking-tight">
              הרשמה
            </h1>
            <CardDescription>
              הזן את הפרטים שלך למטה כדי ליצור חשבון חדש
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div
                  role="status"
                  aria-live="polite"
                  className="p-4 bg-green-50 border border-green-700 rounded-md"
                >
                  <p className="text-green-800 font-medium">
                    ההרשמה הושלמה בהצלחה!
                  </p>
                  <p className="text-green-800 text-sm mt-1">
                    נשלח אליך אימייל אישור. אנא לחץ על הקישור באימייל כדי להפעיל
                    את החשבון.
                  </p>
                </div>
                <Link href="/signin" className="text-white underline underline-offset-4 hover:bg-white/10">
                  חזור לדף ההתחברות
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div
                    id="signup-error"
                    role="alert"
                    className="p-3 bg-red-50 border border-red-700 rounded-md mb-4"
                  >
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}
                <div className="flex flex-col gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">שם מלא</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="ישראל ישראלי"
                      autoComplete="name"
                      aria-describedby={error ? "signup-error" : undefined}
                      aria-invalid={error ? true : undefined}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">אימייל</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      autoComplete="email"
                      aria-describedby={error ? "signup-error" : undefined}
                      aria-invalid={error ? true : undefined}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="password">סיסמה</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      aria-describedby={error ? "signup-error" : undefined}
                      aria-invalid={error ? true : undefined}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="confirm-password">אישור סיסמה</Label>
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      aria-describedby={error ? "signup-error" : undefined}
                      aria-invalid={error ? true : undefined}
                      required
                    />
                  </div>
                  <div className="grid gap-3 rounded-md border border-border/70 bg-background/60 p-3 text-sm">
                    <label
                      htmlFor="terms"
                      className="flex cursor-pointer items-start gap-3 text-right leading-6"
                    >
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(event) =>
                          setAcceptedTerms(event.target.checked)
                        }
                        className="mt-1 size-4"
                        aria-describedby={error ? "signup-error" : undefined}
                        required
                      />
                      <span>
                        קראתי ואני מסכים/ה ל{" "}
                        <Link
                          href="/terms"
                          className="underline underline-offset-4"
                          target="_blank"
                        >
                          תנאי השימוש
                        </Link>
                      </span>
                    </label>
                    <label
                      htmlFor="privacy"
                      className="flex cursor-pointer items-start gap-3 text-right leading-6"
                    >
                      <input
                        id="privacy"
                        name="privacy"
                        type="checkbox"
                        checked={acceptedPrivacy}
                        onChange={(event) =>
                          setAcceptedPrivacy(event.target.checked)
                        }
                        className="mt-1 size-4"
                        aria-describedby={error ? "signup-error" : undefined}
                        required
                      />
                      <span>
                        קראתי ואני מסכים/ה ל{" "}
                        <Link
                          href="/privacy"
                          className="underline underline-offset-4"
                          target="_blank"
                        >
                          מדיניות הפרטיות
                        </Link>
                      </span>
                    </label>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "יוצר חשבון..." : "צור חשבון"}
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        או
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                  >
                    {isLoading ? "מתחבר..." : "הרשם עם Google"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  כבר יש לך חשבון?{" "}
                  <Link href="/signin" className="underline underline-offset-4">
                    התחבר
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
