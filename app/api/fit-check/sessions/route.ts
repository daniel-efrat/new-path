import { NextResponse } from "next/server";
import { AdminAuthError, requireStaffContext } from "@/lib/admin";
import {
  createFitCheckSession,
  listFitCheckSessions,
} from "@/lib/fit-check/server";

export async function GET() {
  try {
    const { serviceSupabase, user } = await requireStaffContext();
    const sessions = await listFitCheckSessions(serviceSupabase, user.id);

    return NextResponse.json({ sessions });
  } catch (error) {
    return fitCheckSessionErrorResponse(error);
  }
}

export async function POST() {
  try {
    const { serviceSupabase, user } = await requireStaffContext();
    const session = await createFitCheckSession(serviceSupabase, user.id);

    return NextResponse.json({ session });
  } catch (error) {
    return fitCheckSessionErrorResponse(error);
  }
}

function fitCheckSessionErrorResponse(error: unknown) {
  if (error instanceof AdminAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("Fit-check sessions API error:", error);
  return NextResponse.json(
    { error: "לא הצלחנו לטעון את היסטוריית בדיקות ההתאמה." },
    { status: 500 }
  );
}
