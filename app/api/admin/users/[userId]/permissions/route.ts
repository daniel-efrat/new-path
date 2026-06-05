import { NextResponse } from "next/server";
import {
  AdminAuthError,
  isAdminAssignablePermission,
  requireAdminContext,
} from "@/lib/admin";

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const body = (await request.json()) as { permissions?: unknown };

    if (!isAdminAssignablePermission(body.permissions)) {
      return NextResponse.json(
        { error: "ערך ההרשאה אינו תקין." },
        { status: 400 }
      );
    }

    const { serviceSupabase, user } = await requireAdminContext();

    if (userId === user.id && body.permissions !== "Admin") {
      return NextResponse.json(
        { error: "לא ניתן להסיר לעצמך את הרשאות המנהל." },
        { status: 400 }
      );
    }

    const { data, error } = await serviceSupabase
      .from("profiles")
      .update({ permissions: body.permissions })
      .eq("id", userId)
      .select("id, permissions")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: "המאובחן לא נמצא." }, { status: 404 });
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Admin permissions API error:", error);
    return NextResponse.json(
      { error: "לא הצלחנו לעדכן הרשאות." },
      { status: 500 }
    );
  }
}
