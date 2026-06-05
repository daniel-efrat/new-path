import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  AdminAuthError,
  requireStaffContext,
} from "@/lib/admin";
import FitCheckClient from "./FitCheckClient";

export const metadata: Metadata = {
  title: "בדיקת התאמה | דרך חדשה",
  description: "ממשק צוות לבדיקת התאמה ראשונית.",
};

export default async function FitCheckPage() {
  try {
    const { user } = await requireStaffContext();

    return <FitCheckClient staffEmail={user.email ?? ""} />;
  } catch (error) {
    if (error instanceof AdminAuthError) {
      if (error.status === 401) {
        redirect("/signin?from=/fit-check");
      }

      redirect("/dashboard");
    }

    throw error;
  }
}
