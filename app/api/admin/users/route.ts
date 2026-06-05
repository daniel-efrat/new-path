import { NextResponse } from "next/server";
import {
  AdminAuthError,
  canManagePermissions,
  requireStaffContext,
} from "@/lib/admin";
import type { ProfilePermission } from "@/lib/permissions";

interface ProfileRow {
  id: string;
  full_name: string | null;
  permissions: ProfilePermission;
  created_at: string | null;
}

interface AdminUserRow {
  id: string;
  email: string | null;
  fullName: string | null;
  permissions: ProfilePermission;
  createdAt: string | null;
  lastSignInAt: string | null;
}

export async function GET() {
  try {
    const { serviceSupabase, user, permissions } = await requireStaffContext();
    const [authUsers, profilesResult] = await Promise.all([
      listAllAuthUsers(serviceSupabase),
      serviceSupabase
        .from("profiles")
        .select("id, full_name, permissions, created_at")
        .order("created_at", { ascending: false }),
    ]);

    if (profilesResult.error) {
      throw profilesResult.error;
    }

    const profilesById = new Map(
      ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [
        profile.id,
        profile,
      ])
    );

    const users: AdminUserRow[] = authUsers.map((user) => {
      const profile = profilesById.get(user.id);
      return {
        id: user.id,
        email: user.email ?? null,
        fullName: profile?.full_name ?? null,
        permissions: profile?.permissions ?? "User",
        createdAt: profile?.created_at ?? user.created_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
      };
    });

    return NextResponse.json({
      canManagePermissions: canManagePermissions(permissions),
      currentUserId: user.id,
      users,
    });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

async function listAllAuthUsers(serviceSupabase: any) {
  const users = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await serviceSupabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const pageUsers = data?.users ?? [];
    users.push(...pageUsers);

    if (pageUsers.length < perPage) {
      return users;
    }

    page += 1;
  }
}

function adminErrorResponse(error: unknown) {
  if (error instanceof AdminAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("Admin users API error:", error);
  return NextResponse.json(
    { error: "לא הצלחנו לטעון את רשימת המאובחנים." },
    { status: 500 }
  );
}
