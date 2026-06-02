import type { Metadata } from "next";
import SignupPageClient from "./SignupPageClient";

export const metadata: Metadata = {
  title: "הרשמה | דרך חדשה",
  description: "יצירת חשבון חדש בדרך חדשה לשמירת ההתקדמות והתוצאות האישיות.",
};

export default function SignupPage() {
  return <SignupPageClient />;
}
