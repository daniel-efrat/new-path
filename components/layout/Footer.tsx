import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-transparent py-8 text-center">
      <div className="container mx-auto px-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} איציק רצימור – דרך חדשה. כל הזכויות שמורות
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            מדיניות פרטיות
          </Link>
          <Link
            href="/accessibility"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            הצהרת נגישות
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            תנאי שימוש
          </Link>
          <Link
            href="/contact"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            צור קשר
          </Link>
        </div>
      </div>
    </footer>
  );
}
