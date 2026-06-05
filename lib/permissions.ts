export const PROFILE_PERMISSIONS = [
  "User",
  "Advisor",
  "Admin",
] as const;

export const ADMIN_ASSIGNABLE_PERMISSIONS = [
  "User",
  "Advisor",
  "Admin",
] as const;

export type ProfilePermission = (typeof PROFILE_PERMISSIONS)[number];
export type AdminAssignablePermission =
  (typeof ADMIN_ASSIGNABLE_PERMISSIONS)[number];

export function canAccessStaffPortal(value: unknown) {
  return value === "Admin" || value === "Advisor";
}

export function canManagePermissions(value: unknown) {
  return value === "Admin";
}

export function isAdminAssignablePermission(
  value: unknown
): value is AdminAssignablePermission {
  return (
    typeof value === "string" &&
    (ADMIN_ASSIGNABLE_PERMISSIONS as readonly string[]).includes(value)
  );
}
