import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Keyboard,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "הצהרת נגישות | דרך חדשה",
  description:
    "הצהרת הנגישות של דרך חדשה: התאמות שבוצעו, אזורים בבדיקה ודרכי פנייה בנושא נגישות.",
};

const lastUpdated = "2 ביוני 2026";

const accessibilityFeatures = [
  {
    title: "מבנה ברור",
    body: "עמודי האתר המרכזיים בנויים עם כותרות, אזורי תוכן וקישורים ברורים כדי להקל על ניווט והתמצאות.",
    icon: ShieldCheck,
  },
  {
    title: "ניווט מקלדת",
    body: "באזורים המרכזיים באתר ניתן לנווט באמצעות מקלדת, עם סימון מיקוד גלוי לרכיבים פעילים.",
    icon: Keyboard,
  },
  {
    title: "קריאות וניגודיות",
    body: "הממשק עושה שימוש בטקסטים ברורים, תמיכה בעברית מימין לשמאל וניגודיות משופרת באזורים המרכזיים.",
    icon: Eye,
  },
];

const sections = [
  {
    title: "התאמות שבוצעו או מתוכננות",
    items: [
      "תמיכה בממשק עברי מימין לשמאל.",
      "כותרות עמוד ברורות ומבנה תוכן סמנטי בעמודים הציבוריים.",
      "אפשרות ניווט באמצעות מקלדת באזורים המרכזיים של האתר.",
      "תוויות לשדות טפסים והודעות שגיאה ברורות בטפסי התחברות והרשמה.",
      "שיפור ניגודיות צבעים באזורים המרכזיים והקפדה על קישורים בעלי משמעות.",
    ],
  },
  {
    title: "איך כדאי לדווח על בעיית נגישות?",
    items: [
      "כתובת העמוד שבו הופיעה הבעיה.",
      "תיאור קצר של הפעולה שניסיתם לבצע ושל מה שלא עבד כמצופה.",
      "סוג הדפדפן, המכשיר ומערכת ההפעלה.",
      "אם נעשה שימוש בטכנולוגיה מסייעת, מומלץ לציין את שמה והגרסה שלה.",
    ],
  },
];

export default function AccessibilityPage() {
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
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-white/75">
              עודכן לאחרונה: {lastUpdated}
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl">
              הצהרת נגישות
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/82">
              דרך חדשה פועלת להנגשת השירותים הדיגיטליים שלה לכלל המאובחנים,
              לרבות אנשים עם מוגבלות. מטרתנו היא שהאתר יהיה נוח לשימוש, ברור,
              ותואם ככל האפשר לדרישות תקן ישראלי 5568 ולהנחיות WCAG 2.x ברמה
              AA.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {accessibilityFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-lg border border-white/20 bg-white/8 p-4"
                >
                  <Icon className="h-7 w-7 text-white" aria-hidden="true" />
                  <h2 className="mt-3 text-lg font-semibold text-white">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/76">
                    {feature.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <div className="relative z-10 mt-8 space-y-5">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-lg border border-white/18 bg-white/9 p-6 backdrop-blur md:p-8"
            >
              <h2 className="text-2xl font-bold text-white">
                {section.title}
              </h2>
              <ul className="mt-5 space-y-3 text-white/78">
                {section.items.map((item) => (
                  <li key={item} className="leading-7">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="relative z-10 mt-8 rounded-lg border border-white/18 bg-white/9 p-6 backdrop-blur md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <Sparkles className="h-8 w-8 shrink-0 text-white" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-bold text-white">המשך שיפור</h2>
              <p className="mt-4 leading-8 text-white/78">
                אנו ממשיכים לבדוק את האתר ולשפר רכיבים, טפסים, דוחות ואזורים
                הדורשים התחברות. אם נתקלתם בבעיה, נשמח לקבל פנייה כדי שנוכל
                לבדוק ולתקן.
              </p>
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-8 rounded-lg border border-white/22 bg-slate-950/28 p-6 backdrop-blur md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <MessageCircle className="h-8 w-8 shrink-0 text-white" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                פנייה בנושא נגישות
              </h2>
              <p className="mt-4 leading-8 text-white/78">
                אפשר לפנות דרך טופס צור קשר של דרך חדשה. הטופס ייפתח עם נושא
                נגישות מוכן מראש כדי שנוכל לזהות את הפנייה ולטפל בה בהתאם.
              </p>
              <Link
                href="/contact?subject=%D7%A0%D7%92%D7%99%D7%A9%D7%95%D7%AA"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/24 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-white/90"
              >
                מעבר לטופס צור קשר
                <Send className="h-4 w-4 scale-x-[-1]" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
