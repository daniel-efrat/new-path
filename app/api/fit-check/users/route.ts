import { NextRequest, NextResponse } from "next/server";
import { AdminAuthError, requireStaffContext } from "@/lib/admin";
import { searchFitCheckUsers } from "@/lib/fit-check/server";

export async function GET(request: NextRequest) {
  try {
    const { serviceSupabase } = await requireStaffContext();
    const query = request.nextUrl.searchParams.get("q") ?? "";
    const users = await searchFitCheckUsers(serviceSupabase, query);

    return NextResponse.json({ users });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Fit-check user search API error:", error);
    return NextResponse.json(
      { error: "לא הצלחנו לחפש מאובחנים." },
      { status: 500 }
    );
  }
}
