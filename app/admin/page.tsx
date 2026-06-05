"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ADMIN_ASSIGNABLE_PERMISSIONS,
  type AdminAssignablePermission,
  type ProfilePermission,
} from "@/lib/permissions";

interface AdminUser {
  id: string;
  email: string | null;
  fullName: string | null;
  permissions: ProfilePermission;
  createdAt: string | null;
  lastSignInAt: string | null;
}

const permissionLabels: Record<AdminAssignablePermission, string> = {
  User: "מאובחן",
  Advisor: "יועץ",
  Admin: "מנהל",
};

const badgeClasses: Record<string, string> = {
  Admin: "border-emerald-300/40 bg-emerald-400/15 text-emerald-50",
  Advisor: "border-amber-300/40 bg-amber-400/15 text-amber-50",
  User: "border-white/25 bg-white/10 text-white/80",
};

type PermissionFilter = "all" | AdminAssignablePermission;

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [canManagePermissions, setCanManagePermissions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [permissionFilter, setPermissionFilter] =
    useState<PermissionFilter>("all");

  const adminCount = useMemo(
    () => users.filter((user) => user.permissions === "Admin").length,
    [users]
  );

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        [user.email, user.fullName]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery));
      const matchesPermission =
        permissionFilter === "all" || user.permissions === permissionFilter;

      return matchesQuery && matchesPermission;
    });
  }, [permissionFilter, searchQuery, users]);

  const loadUsers = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push("/signin?from=/admin");
        return;
      }

      if (response.status === 403) {
        setError("נדרשות הרשאות מנהל כדי לצפות באזור זה.");
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "לא הצלחנו לטעון מאובחנים.");
      }

      setCurrentUserId(payload.currentUserId ?? null);
      setCanManagePermissions(Boolean(payload.canManagePermissions));
      setUsers(sortUsers(payload.users ?? [], payload.currentUserId ?? null));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "לא הצלחנו לטעון מאובחנים."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const updatePermission = async (
    userId: string,
    permissions: AdminAssignablePermission
  ) => {
    setUpdatingUserId(userId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "לא הצלחנו לעדכן הרשאות.");
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId ? { ...user, permissions } : user
        )
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "לא הצלחנו לעדכן הרשאות."
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="dashboard-glass-page min-h-screen px-4 py-8 sm:px-6" dir="rtl">
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 text-white">
        <header className="dashboard-glass-panel rounded-lg px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-normal">
                  ניהול מאובחנים
                </h1>
                <p className="mt-1 text-sm text-white/70">
                  צפייה במאובחנים, נתוני פעילות והרשאות צוות.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/20 bg-white/10 text-white">
                <UsersRound className="ml-1 size-3.5" />
                {formatUserCount(users.length)}
              </Badge>
              <Badge className="border-emerald-300/40 bg-emerald-400/15 text-emerald-50">
                <BadgeCheck className="ml-1 size-3.5" />
                {formatAdminCount(adminCount)}
              </Badge>
              <Button
                type="button"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/15"
                onClick={() => loadUsers(true)}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="ml-2 size-4 animate-spin" />
                ) : (
                  <RefreshCw className="ml-2 size-4" />
                )}
                רענון
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 border-t border-white/12 pt-5 md:grid-cols-[minmax(0,1fr)_240px]">
            <label className="relative block">
              <span className="sr-only">חיפוש מאובחנים</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/55" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="חיפוש לפי שם או אימייל"
                className="h-11 border-white/25 bg-slate-950/35 pl-10 text-white placeholder:text-white/45 focus-visible:ring-white/35"
              />
            </label>

            <label className="relative block">
              <span className="sr-only">סינון לפי הרשאה</span>
              <Filter className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/55" />
              <ChevronDown className="pointer-events-none absolute left-[5px] top-1/2 size-4 -translate-y-1/2 text-white/70" />
              <select
                value={permissionFilter}
                onChange={(event) =>
                  setPermissionFilter(event.target.value as PermissionFilter)
                }
                className="h-11 w-full appearance-none rounded-md border border-white/25 bg-slate-950/35 pl-8 pr-10 text-sm leading-[2.75rem] text-white outline-none transition focus:border-white/60 focus:ring-2 focus:ring-white/25"
              >
                <option value="all">כל ההרשאות</option>
                {ADMIN_ASSIGNABLE_PERMISSIONS.map((permission) => (
                  <option key={permission} value={permission}>
                    {permissionLabels[permission]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        {error ? (
          <div className="dashboard-glass-panel flex items-center gap-3 rounded-lg border-red-200/30 bg-red-950/30 px-5 py-4 text-sm text-red-50">
            <AlertTriangle className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <section className="dashboard-glass-panel overflow-hidden rounded-lg">
          {isLoading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-white/80">
              <Loader2 className="size-8 animate-spin" />
              <p>טוען מאובחנים...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center text-white/70">
              לא נמצאו מאובחנים.
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center text-white/70">
              לא נמצאו מאובחנים שתואמים לסינון.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/15 bg-white/5 text-right text-xs tracking-normal text-white/60">
                    <th className="px-5 py-3 font-semibold">מאובחן</th>
                    <th className="px-5 py-3 font-semibold">הרשאה נוכחית</th>
                    {canManagePermissions ? (
                      <th className="px-5 py-3 font-semibold">עדכון הרשאה</th>
                    ) : null}
                    <th className="px-5 py-3 font-semibold">נוצר בתאריך</th>
                    <th className="px-5 py-3 font-semibold">כניסה אחרונה</th>
                    <th className="px-5 py-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      role="link"
                      tabIndex={0}
                      className="cursor-pointer border-b border-white/10 transition hover:bg-white/5 focus:bg-white/10 focus:outline-none"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(`/admin/users/${user.id}`);
                        }
                      }}
                    >
                      <td className="px-5 py-4">
                        <div className="max-w-[320px]">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium" dir="ltr">
                              {user.email || "ללא אימייל"}
                            </p>
                            {user.id === currentUserId ? (
                              <span className="text-sm text-white/65">
                                (אתה)
                              </span>
                            ) : null}
                          </div>
                          {user.fullName ? (
                            <p className="mt-1 truncate text-xs text-white/55">
                              {user.fullName}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          className={
                            badgeClasses[user.permissions] ?? badgeClasses.User
                          }
                        >
                          {permissionLabels[user.permissions as AdminAssignablePermission] ?? user.permissions}
                        </Badge>
                      </td>
                      {canManagePermissions ? (
                        <td className="px-5 py-4">
                          <div className="relative inline-block">
                            <ChevronDown className="pointer-events-none absolute left-[5px] top-1/2 size-4 -translate-y-1/2 text-white/70" />
                            <select
                              className="h-10 min-w-[150px] appearance-none rounded-md border border-white/25 bg-slate-950/70 pl-8 pr-3 text-sm leading-10 text-white outline-none transition focus:border-white/60 disabled:opacity-60"
                              value={
                                ADMIN_ASSIGNABLE_PERMISSIONS.includes(
                                  user.permissions as AdminAssignablePermission
                                )
                                  ? user.permissions
                                  : "User"
                              }
                              disabled={
                                updatingUserId === user.id ||
                                user.id === currentUserId
                              }
                              onClick={(event) => event.stopPropagation()}
                              onKeyDown={(event) => event.stopPropagation()}
                              onChange={(event) =>
                                updatePermission(
                                  user.id,
                                  event.target.value as AdminAssignablePermission
                                )
                              }
                            >
                              {ADMIN_ASSIGNABLE_PERMISSIONS.map((permission) => (
                                <option key={permission} value={permission}>
                                  {permissionLabels[permission]}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      ) : null}
                      <td className="px-5 py-4 text-white/70">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-white/70">
                        {formatDate(user.lastSignInAt)}
                      </td>
                      <td className="px-5 py-4 text-white/60">
                        <ChevronLeft className="size-5" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatUserCount(count: number) {
  return count === 1 ? "מאובחן אחד" : `${count} מאובחנים`;
}

function formatAdminCount(count: number) {
  return count === 1 ? "מנהל אחד" : `${count} מנהלים`;
}

function sortUsers(users: AdminUser[], currentUserId: string | null) {
  if (!currentUserId) return users;

  return [...users].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return 0;
  });
}
