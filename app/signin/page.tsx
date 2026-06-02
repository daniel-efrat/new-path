import type { Metadata } from "next";
import SigninPageClient from "./SigninPageClient";

export const metadata: Metadata = {
  title: "התחברות | דרך חדשה",
  description: "כניסה לחשבון דרך חדשה כדי להמשיך לשאלון, לתוצאות ולפרופיל האישי.",
};

export default function SigninPage() {
  return <SigninPageClient />;
}
