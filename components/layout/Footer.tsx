import Link from "next/link";

const footerLinks = [
  { href: "/privacy", label: "מדיניות פרטיות" },
  { href: "/accessibility", label: "הצהרת נגישות" },
  { href: "/terms", label: "תנאי שימוש" },
  { href: "/sitemap", label: "מפת אתר" },
  { href: "/contact", label: "צור קשר" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-transparent py-8 text-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {footerLinks.map((link, index) => (
            <span key={link.href} className="flex items-center gap-3">
              {index > 0 ? (
                <span className="text-sm text-muted-foreground/50">|</span>
              ) : null}
              <Link
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            </span>
          ))}
        </div>
        <p className="mt-3 text-[13px] leading-5 text-muted-foreground/70">
          © {new Date().getFullYear()} איציק רצימור – דרך חדשה. כל הזכויות שמורות
        </p>
      </div>
    </footer>
  );
}
