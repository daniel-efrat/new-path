import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  FileText,
  Home,
  LockKeyhole,
  Map,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "מפת אתר | דרך חדשה",
  description: "מפת אתר של דרך חדשה: עמודי מידע, חשבון, שאלונים, דוחות ואזור צוות.",
};

const sitemapSections = [
  {
    title: "עמודים כלליים",
    icon: Home,
    links: [
      { href: "/", label: "עמוד הבית" },
      { href: "/aboutHolland", label: "אודות שאלון הולנד" },
      { href: "/contact", label: "צור קשר" },
    ],
  },
  {
    title: "חשבון וגישה",
    icon: LockKeyhole,
    links: [
      { href: "/signin", label: "התחברות" },
      { href: "/signup", label: "הרשמה" },
      { href: "/auth/reset-password", label: "איפוס סיסמה" },
      { href: "/dashboard", label: "לוח בקרה אישי" },
      { href: "/profile", label: "פרופיל ותוצאות" },
    ],
  },
  {
    title: "שאלונים ודוחות",
    icon: ClipboardList,
    links: [
      { href: "/questionnaire", label: "שאלון דרך חדשה" },
      { href: "/questionnaire/guidance", label: "מפת כיוון ראשונית" },
      { href: "/questionnaire/diagnostic", label: "דו״ח אבחוני תעסוקתי" },
      { href: "/questionnaire/occupation/flow", label: "בחירת תחומים מקצועיים" },
      { href: "/questionnaire/occupation/rank", label: "דירוג תחומים מקצועיים" },
    ],
  },
  {
    title: "מדיניות ומידע משפטי",
    icon: FileText,
    links: [
      { href: "/privacy", label: "מדיניות פרטיות" },
      { href: "/terms", label: "תנאי שימוש" },
      { href: "/accessibility", label: "הצהרת נגישות" },
      { href: "/sitemap", label: "מפת אתר" },
    ],
  },
  {
    title: "אזור צוות",
    icon: ShieldCheck,
    links: [
      { href: "/admin", label: "ניהול מאובחנים" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div dir="rtl" className="relative min-h-screen px-4 pb-20 pt-10">
      <div className="relative z-10 mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/85 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          חזרה לעמוד הבית
        </Link>

        <section className="dashboard-glass-panel rounded-lg p-6 md:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white/75">דרך חדשה</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl">
                מפת אתר
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/82">
                קישורים מהירים לעמודי המידע, החשבון, השאלונים, הדוחות ואזור הצוות.
              </p>
            </div>
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-primary">
              <Map className="size-7" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {sitemapSections.map((section) => {
            const Icon = section.icon;

            return (
              <article
                key={section.title}
                className="rounded-lg border border-white/18 bg-white/9 p-5 text-white backdrop-blur"
              >
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <Icon className="size-5" aria-hidden="true" />
                  {section.title}
                </h2>
                <ul className="mt-4 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group inline-flex w-full items-center justify-between gap-3 rounded-md border border-white/10 bg-white/6 px-3 py-2 text-white/86 transition hover:border-white/24 hover:bg-white/12 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                      >
                        <span>{link.label}</span>
                        <ArrowLeft
                          className="size-4 opacity-65 transition group-hover:-translate-x-0.5 group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
