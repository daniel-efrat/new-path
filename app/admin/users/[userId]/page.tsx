"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProfilePermission } from "@/lib/permissions";

interface UserDetailResponse {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    confirmedAt: string | null;
    lastSignInAt: string | null;
    appMetadata: Record<string, unknown>;
    userMetadata: Record<string, unknown>;
    profile: {
      fullName: string | null;
      permissions: ProfilePermission;
      createdAt: string | null;
    };
  };
  counts: {
    submissions: number;
    answers: number;
    guidanceReports: number;
    diagnosticReports: number;
    hollandResults: number;
    designationChoices: number;
  };
  activity: {
    submissions: Array<Record<string, unknown>>;
    progress: Record<string, unknown> | null;
    hollandResults: Array<Record<string, unknown>>;
    designationChoices: Array<Record<string, unknown>>;
    guidanceReports: Array<Record<string, unknown>>;
    diagnosticReports: Array<Record<string, unknown>>;
  };
}

const permissionLabels: Record<ProfilePermission, string> = {
  User: "מאובחן",
  Advisor: "יועץ",
  Admin: "מנהל",
};

const badgeClasses: Record<ProfilePermission, string> = {
  Admin: "border-emerald-300/40 bg-emerald-400/15 text-emerald-50",
  Advisor: "border-amber-300/40 bg-amber-400/15 text-amber-50",
  User: "border-white/25 bg-white/10 text-white/80",
};

export default function StaffUserProfilePage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const [data, setData] = useState<UserDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${params.userId}`, {
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push(`/signin?from=/admin/users/${params.userId}`);
        return;
      }

      if (response.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "לא הצלחנו לטעון את נתוני המאובחן.");
      }

      setData(payload);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "לא הצלחנו לטעון את נתוני המאובחן."
      );
    } finally {
      setIsLoading(false);
    }
  }, [params.userId, router]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <div className="dashboard-glass-page min-h-screen px-4 py-8 sm:px-6" dir="rtl">
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 text-white">
        <header className="dashboard-glass-panel rounded-lg px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                <UserRound className="size-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-normal">
                  פרופיל מאובחן
                </h1>
                <p className="mt-1 text-sm text-white/70">
                  נתוני חשבון, הרשאות ופעילות במערכת.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/15"
              onClick={() => router.push("/admin")}
            >
              <ArrowRight className="ml-2 size-4" />
              חזרה לניהול מאובחנים
            </Button>
          </div>
        </header>

        {isLoading ? (
          <section className="dashboard-glass-panel flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-lg text-white/80">
            <Loader2 className="size-8 animate-spin" />
            <p>טוען נתוני מאובחן...</p>
          </section>
        ) : error ? (
          <section className="dashboard-glass-panel flex items-center gap-3 rounded-lg border-red-200/30 bg-red-950/30 px-5 py-4 text-sm text-red-50">
            <AlertTriangle className="size-5 shrink-0" />
            <span>{error}</span>
          </section>
        ) : data ? (
          <>
            <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <Panel title="פרטי חשבון" icon={<Mail className="size-5" />}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="אימייל" value={data.user.email || "-"} ltr />
                  <Field label="שם מלא" value={data.user.profile.fullName || "-"} />
                  <Field label="טלפון" value={data.user.phone || "-"} ltr />
                  <Field label="מזהה מאובחן" value={data.user.id} ltr />
                  <Field label="נוצר בתאריך" value={formatDate(data.user.createdAt)} />
                  <Field label="אומת בתאריך" value={formatDate(data.user.confirmedAt)} />
                  <Field label="כניסה אחרונה" value={formatDate(data.user.lastSignInAt)} />
                  <Field label="עודכן בתאריך" value={formatDate(data.user.updatedAt)} />
                </div>
              </Panel>

              <Panel title="הרשאות" icon={<ShieldCheck className="size-5" />}>
                <div className="flex flex-col gap-4">
                  <Badge className={badgeClasses[data.user.profile.permissions]}>
                    {permissionLabels[data.user.profile.permissions]}
                  </Badge>
                  <Field
                    label="פרופיל נוצר בתאריך"
                    value={formatDate(data.user.profile.createdAt)}
                  />
                </div>
              </Panel>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <Metric label="הגשות" value={data.counts.submissions} />
              <Metric label="תשובות" value={data.counts.answers} />
              <Metric label="דוחות כיוון" value={data.counts.guidanceReports} />
              <Metric label="דוחות אבחון" value={data.counts.diagnosticReports} />
              <Metric label="תוצאות הולנד" value={data.counts.hollandResults} />
              <Metric label="בחירות ייעוד" value={data.counts.designationChoices} />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <ActivityPanel
                title="הגשות אחרונות"
                icon={<ClipboardList className="size-5" />}
                rows={data.activity.submissions}
                fields={["status", "created_at", "updated_at"]}
                getLinks={(row) => getSubmissionReportLinks(data.user.id, row)}
              />
              <ActivityPanel
                title="דוחות כיוון"
                icon={<FileText className="size-5" />}
                rows={data.activity.guidanceReports}
                fields={["status", "provider", "model", "created_at"]}
                getHref={(row) =>
                  getReportHref("guidance", data.user.id, row.id)
                }
              />
              <ActivityPanel
                title="דוחות אבחון"
                icon={<BarChart3 className="size-5" />}
                rows={data.activity.diagnosticReports}
                fields={["status", "provider", "model", "created_at"]}
                getHref={(row) =>
                  getReportHref("diagnostic", data.user.id, row.id)
                }
              />
              <ActivityPanel
                title="תוצאות הולנד"
                icon={<BarChart3 className="size-5" />}
                rows={data.activity.hollandResults}
                fields={["riasec_code", "created_at"]}
              />
              <ActivityPanel
                title="בחירות ייעוד"
                icon={<BriefcaseBusiness className="size-5" />}
                rows={data.activity.designationChoices}
                fields={["occupation_serial", "rank", "selected_statements", "updated_at"]}
              />
              <Panel title="התקדמות ומטאדאטה" icon={<FileText className="size-5" />}>
                <JsonBlock label="התקדמות שלבים" value={data.activity.progress} />
                <JsonBlock label="User metadata" value={data.user.userMetadata} />
                <JsonBlock label="App metadata" value={data.user.appMetadata} />
              </Panel>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="dashboard-glass-panel rounded-lg px-5 py-5">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 px-3 py-3">
      <p className="text-xs text-white/55">{label}</p>
      <p className="mt-1 break-words text-sm text-white" dir={ltr ? "ltr" : "rtl"}>
        {value}
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="dashboard-glass-panel rounded-lg px-4 py-4">
      <p className="text-xs text-white/60">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function ActivityPanel({
  title,
  icon,
  rows,
  fields,
  getHref,
  getLinks,
}: {
  title: string;
  icon: React.ReactNode;
  rows: Array<Record<string, unknown>>;
  fields: string[];
  getHref?: (row: Record<string, unknown>) => string | null;
  getLinks?: (
    row: Record<string, unknown>
  ) => Array<{ href: string; label: string }>;
}) {
  return (
    <Panel title={title} icon={icon}>
      {rows.length === 0 ? (
        <p className="text-sm text-white/65">אין נתונים להצגה.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row, index) => {
            const href = getHref?.(row) ?? null;
            const links = getLinks?.(row) ?? [];

            return (
              <div
                key={`${title}-${index}`}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-3"
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  {fields.map((field) => (
                    <Field
                      key={field}
                      label={fieldLabels[field] ?? field}
                      value={formatUnknown(row[field])}
                      ltr={field.endsWith("_at") || field === "id"}
                    />
                  ))}
                </div>
                {href ? (
                  <a
                    className="mt-3 inline-flex rounded-md border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                    href={href}
                  >
                    פתיחת הדוח
                  </a>
                ) : null}
                {links.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {links.map((link) => (
                      <a
                        key={link.href}
                        className="inline-flex rounded-md border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                        href={link.href}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="mb-3 rounded-md border border-white/10 bg-slate-950/45 px-3 py-3">
      <p className="mb-2 text-xs text-white/55">{label}</p>
      <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words text-left text-xs text-white/75" dir="ltr">
        {JSON.stringify(value ?? {}, null, 2)}
      </pre>
    </div>
  );
}

const fieldLabels: Record<string, string> = {
  status: "סטטוס",
  provider: "ספק",
  model: "מודל",
  created_at: "נוצר בתאריך",
  updated_at: "עודכן בתאריך",
  riasec_code: "קוד הולנד",
  occupation_serial: "מספר עיסוק",
  rank: "דירוג",
  selected_statements: "משפטים שנבחרו",
};

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatUnknown(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
    return formatDate(value);
  }
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getReportHref(
  kind: "guidance" | "diagnostic",
  userId: string,
  reportId: unknown
) {
  if (typeof reportId !== "string" || !reportId) return null;

  const pathname =
    kind === "guidance" ? "/questionnaire/guidance" : "/questionnaire/diagnostic";
  return `${pathname}?saved=1&staffUserId=${encodeURIComponent(
    userId
  )}&reportId=${encodeURIComponent(reportId)}`;
}

function getSubmissionReportLinks(userId: string, row: Record<string, unknown>) {
  const links: Array<{ href: string; label: string }> = [];
  const guidanceHref = getReportHref("guidance", userId, row.guidance_report_id);
  const diagnosticHref = getReportHref(
    "diagnostic",
    userId,
    row.diagnostic_report_id
  );

  if (guidanceHref) links.push({ href: guidanceHref, label: "פתיחת דוח כיוון" });
  if (diagnosticHref) {
    links.push({ href: diagnosticHref, label: "פתיחת דוח אבחון" });
  }

  return links;
}
