"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import supabase from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 900);
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "לא ניתן היה לעדכן את הסיסמה"
      );
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
              איפוס סיסמה
            </h1>
            <CardDescription>בחר סיסמה חדשה לחשבון שלך</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-md border border-green-700 bg-green-50 p-4"
              >
                <p className="text-sm font-medium text-green-800">
                  הסיסמה עודכנה בהצלחה. מעבירים אותך ללוח הבקרה.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error ? (
                  <div
                    id="reset-password-error"
                    role="alert"
                    className="mb-4 rounded-md border border-red-700 bg-red-50 p-3"
                  >
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                ) : null}
                <div className="flex flex-col gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="password">סיסמה חדשה</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      aria-describedby={
                        error ? "reset-password-error" : undefined
                      }
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
                      aria-describedby={
                        error ? "reset-password-error" : undefined
                      }
                      aria-invalid={error ? true : undefined}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "מעדכן..." : "עדכן סיסמה"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
