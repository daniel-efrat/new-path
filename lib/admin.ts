import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  canAccessStaffPortal,
  canManagePermissions,
  isAdminAssignablePermission,
  type ProfilePermission,
} from "@/lib/permissions";
export { canManagePermissions, isAdminAssignablePermission };

export interface AdminContext {
  serviceSupabase: SupabaseClient;
  user: User;
  permissions: ProfilePermission;
}

export async function requireStaffContext(): Promise<AdminContext> {
  const authSupabase = await createCookieAuthClient();
  const {
    data: { user },
    error: userError,
  } = await authSupabase.auth.getUser();

  if (userError || !user) {
    throw new AdminAuthError("לא התחברת למערכת.", 401);
  }

  const serviceSupabase = createServiceClient();
  const { data: profile, error: profileError } = await serviceSupabase
    .from("profiles")
    .select("permissions")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  const staffPermissions = profile?.permissions;

  if (!canAccessStaffPortal(staffPermissions)) {
    throw new AdminAuthError("נדרשות הרשאות צוות.", 403);
  }

  return {
    serviceSupabase,
    user,
    permissions: staffPermissions as ProfilePermission,
  };
}

export async function requireAdminContext(): Promise<AdminContext> {
  const context = await requireStaffContext();

  if (!canManagePermissions(context.permissions)) {
    throw new AdminAuthError("נדרשות הרשאות מנהל.", 403);
  }

  return context;
}

export class AdminAuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminAuthError";
    this.status = status;
  }
}

function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service configuration.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function createCookieAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase auth configuration.");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
