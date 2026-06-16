"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerLinks = [
  { href: "/privacy", label: "מדיניות פרטיות" },
  { href: "/accessibility", label: "הצהרת נגישות" },
  { href: "/terms", label: "תנאי שימוש" },
  { href: "/sitemap", label: "מפת אתר" },
  { href: "/contact", label: "צור קשר" },
];

export default function Footer() {
  const pathname = usePathname();
  const isQuestionnaireRoute = pathname?.startsWith("/questionnaire");

  return (
    <footer
      className={
        isQuestionnaireRoute
          ? "hidden border-t border-white/15 bg-slate-950/55 py-8 text-center shadow-[0_-12px_30px_rgba(15,23,42,0.18)] backdrop-blur-md md:fixed md:inset-x-0 md:bottom-0 md:z-30 md:block"
          : "border-t border-border/60 bg-transparent py-8 text-center"
      }
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[14px]">
          {footerLinks.map((link, index) => (
            <span key={link.href} className="flex items-center gap-3">
              {index > 0 ? (
                <span
                  className={
                    isQuestionnaireRoute
                      ? "text-white/45"
                      : "text-muted-foreground/50"
                  }
                >
                  |
                </span>
              ) : null}
              <Link
                href={link.href}
                className={
                  isQuestionnaireRoute
                    ? "text-white/80 hover:text-white"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            </span>
          ))}
        </div>
        <p
          className={
            isQuestionnaireRoute
              ? "mt-3 text-[13px] leading-5 text-white/60"
              : "mt-3 text-[13px] leading-5 text-muted-foreground/70"
          }
        >
          © {new Date().getFullYear()} איציק רצימור – דרך חדשה. כל הזכויות שמורות
        </p>
      </div>
    </footer>
  );
}
