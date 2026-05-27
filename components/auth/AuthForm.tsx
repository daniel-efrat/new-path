"use client";

import { useState } from "react";
import supabase from "@/lib/supabase";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: "אנא הזן כתובת אימייל תקינה" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: "success",
        text: "בדוק את האימייל שלך לקישור ההתחברות!",
      });
    } catch (error) {
      console.error("Auth error:", error);
      setMessage({
        type: "error",
        text: "שליחת הקישור נכשלה. אנא נסה שוב.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white text-background p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">התחברות / הרשמה</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              כתובת אימייל
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full p-3 border border-gray-500 rounded-md focus-visible:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-primary text-white rounded-md hover:bg-blue-900 focus-visible:outline-none ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "שולח..." : "שלח קישור קסם"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md ${
              message.type === "success"
                ? "bg-green-100 text-green-900"
                : "bg-red-100 text-red-900"
            }`}
          >
            {message.text}
          </div>
        )}

        <p className="mt-6 text-sm text-center text-gray-700">
          נשלח לך קישור קסם לאימייל שלך להתחברות.
          <br />
          אין צורך בסיסמה!
        </p>
      </div>
    </div>
  );
}
