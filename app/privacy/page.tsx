import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Database, Lock, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "מדיניות פרטיות | דרך חדשה",
  description:
    "מדיניות הפרטיות של דרך חדשה: איזה מידע נאסף באפליקציה, למה הוא משמש, עם מי הוא עשוי להיות משותף ומהן זכויות המשתמשים.",
};

const lastUpdated = "27 במאי 2026";

const dataTypes = [
  {
    title: "פרטי חשבון והתחברות",
    body: "שם מלא, כתובת אימייל, סיסמה מוצפנת או התחברות באמצעות Google, מזהה משתמש ונתוני אימות בסיסיים הנדרשים לניהול החשבון.",
  },
  {
    title: "תשובות לשאלוני הכוונה",
    body: "בחירות תכונות אישיות, תשובות לשאלות התאמה, דירוגים, עוגני קריירה, בחירות במסלולים ותשובות נוספות שנועדו להבין נטיות, העדפות וחוזקות מקצועיות.",
  },
  {
    title: "תוצאות והמלצות",
    body: "קוד ותוצאות Holland/RIASEC, התאמות למקצועות, מסלולי לימוד, מכללות, טווחי שכר, סטטוס השלמת שאלון והיסטוריית התקדמות.",
  },
  {
    title: "שימוש ושיפור השירות",
    body: "נתוני פעילות טכניים כגון כניסות, שגיאות, קליקים על המלצות או הפניות, ונתונים שנדרשים לאבטחה, תמיכה, מניעת שימוש לרעה ושיפור חוויית המשתמש.",
  },
];

const sections = [
  {
    title: "למה אנחנו משתמשים במידע?",
    items: [
      "כדי לאפשר הרשמה, התחברות וניהול חשבון אישי.",
      "כדי לשמור התקדמות ותשובות, כך שאפשר יהיה להמשיך את השאלון ולצפות בתוצאות.",
      "כדי לחשב פרופיל התאמה, להציג תוצאות אישיות ולהציע מקצועות, מסלולי לימוד ומוסדות רלוונטיים.",
      "כדי לתפעל את האפליקציה, לאתר תקלות, לשפר שאלונים, למנוע שימוש לרעה ולשמור על אבטחת השירות.",
      "כדי למדוד הפניות למוסדות לימוד, אם המשתמש בוחר ללחוץ על המלצה או ליצור קשר דרך האפליקציה.",
    ],
  },
  {
    title: "עם מי המידע עשוי להיות משותף?",
    items: [
      "ספקי תשתית ואימות, ובכלל זה Supabase, לצורך שמירת מידע, ניהול משתמשים והרשאות גישה.",
      "ספקי אוטומציה או בינה מלאכותית, כגון n8n ו-OpenAI, ככל שנעשה בהם שימוש לצורך יצירת המלצות או עיבוד תשובות.",
      "מוסדות לימוד או שותפי הפניה, רק כאשר הדבר נדרש כדי לטפל בפנייה, למדוד הפניה או לאפשר יצירת קשר בעקבות בחירה של המשתמש.",
      "רשויות מוסמכות או גורמים אחרים כאשר קיימת חובה לפי דין, צו, הליך משפטי או צורך להגן על זכויות המשתמשים והשירות.",
    ],
  },
  {
    title: "מה לא נעשה עם המידע?",
    items: [
      "לא נמכור מידע אישי לצדדים שלישיים.",
      "לא נשתמש בתשובות לשאלון כדי לקבל החלטות מחייבות לגבי קבלה ללימודים, העסקה או זכאות לשירותים.",
      "לא נפרסם תשובות אישיות או תוצאות אישיות באופן שמזהה את המשתמש ללא הסכמה.",
    ],
  },
  {
    title: "שמירת מידע ומחיקה",
    items: [
      "נשמור מידע כל עוד הוא נחוץ למטרות המתוארות במדיניות זו, לניהול החשבון, להצגת תוצאות, לעמידה בדרישות דין, לאבטחה או לטיפול בפניות.",
      "כאשר מידע כבר אינו דרוש, נפעל למחיקה, התממה או צמצום שלו בהתאם ליכולת הטכנית ולדרישות הדין.",
      "מחיקת חשבון או בקשת מחיקה עשויה להשפיע על היכולת לשחזר תשובות, תוצאות והמלצות.",
    ],
  },
];

export default function PrivacyPage() {
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
              מדיניות הפרטיות
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/82">
              דרך חדשה היא אפליקציה להכוונה תעסוקתית ולימודית. המדיניות הזו
              מסבירה בשפה פשוטה איזה מידע המשתמש משתף באפליקציה, למה אנחנו
              צריכים אותו, איך הוא עשוי לעבור לספקים או שותפים, ואילו זכויות
              עומדות לרשות המשתמש ביחס למידע האישי שלו.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-white/20 bg-white/8 p-4">
              <ShieldCheck className="h-7 w-7 text-white" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-semibold text-white">
                מידע לפי צורך
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/76">
                נאסף מידע שנדרש להפעלת השאלון, להצגת תוצאות ולשמירת החשבון.
              </p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/8 p-4">
              <Database className="h-7 w-7 text-white" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-semibold text-white">
                תשובות ותוצאות
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/76">
                תשובות המשתמש משמשות להתאמת מקצועות, מסלולים ומוסדות לימוד.
              </p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/8 p-4">
              <Lock className="h-7 w-7 text-white" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-semibold text-white">
                שליטה וזכויות
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/76">
                ניתן לבקש עיון, תיקון או מחיקה של מידע אישי, בכפוף לדין.
              </p>
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-8 rounded-lg border border-white/18 bg-white/9 p-6 backdrop-blur md:p-8">
          <h2 className="text-2xl font-bold text-white">
            איזה מידע נאסף באפליקציה?
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {dataTypes.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-white/18 bg-slate-950/24 p-5"
              >
                <h3 className="text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 leading-7 text-white/76">{item.body}</p>
              </article>
            ))}
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
              <h2 className="text-2xl font-bold text-white">
                שימוש בבינה מלאכותית
              </h2>
              <p className="mt-4 leading-8 text-white/78">
                חלק מההמלצות עשויות להיווצר או להסתייע במערכות אוטומטיות ובינה
                מלאכותית. המטרה היא להציע כיווני קריירה ולימודים לפי התשובות
                שנמסרו, ולא לקבוע עבור המשתמש החלטה סופית או מחייבת. מומלץ
                להתייחס לתוצאות כאל כלי עזר, לצד שיקול דעת אישי, ייעוץ מקצועי
                ובדיקת מידע מול מוסדות הלימוד עצמם.
              </p>
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-8 rounded-lg border border-white/18 bg-white/9 p-6 backdrop-blur md:p-8">
          <h2 className="text-2xl font-bold text-white">אבטחת מידע</h2>
          <p className="mt-4 leading-8 text-white/78">
            אנו נוקטים אמצעים סבירים להגנה על המידע, כולל הרשאות גישה, אימות
            משתמשים, שימוש בשירותי תשתית מאובטחים והפרדה בין מידע של משתמשים.
            עם זאת, שום מערכת מקוונת אינה חסינה לחלוטין, ולכן חשוב להשתמש בסיסמה
            חזקה, לשמור על פרטי התחברות ולא לשתף גישה לחשבון.
          </p>
        </section>

        <section className="relative z-10 mt-8 rounded-lg border border-white/18 bg-white/9 p-6 backdrop-blur md:p-8">
          <h2 className="text-2xl font-bold text-white">
            זכויות המשתמש ביחס למידע
          </h2>
          <p className="mt-4 leading-8 text-white/78">
            לפי הדין החל, ובכלל זה חוק הגנת הפרטיות, ייתכן שעומדות למשתמש זכויות
            לעיין במידע אישי שנשמר עליו, לבקש תיקון של מידע שאינו נכון, שלם,
            ברור או מעודכן, ולבקש מחיקה או הגבלה של שימוש במידע במקרים המתאימים.
            בקשות כאלה יטופלו בהתאם לדין, לאחר שנוכל לזהות את מבקש הבקשה ולוודא
            שהיא נוגעת למידע שלו.
          </p>
        </section>

        <section className="relative z-10 mt-8 rounded-lg border border-white/18 bg-white/9 p-6 backdrop-blur md:p-8">
          <h2 className="text-2xl font-bold text-white">
            קטינים, דיוור ושינויים במדיניות
          </h2>
          <p className="mt-4 leading-8 text-white/78">
            השירות מיועד למשתמשים שמסוגלים למסור מידע ולקבל החלטות לגבי שימוש
            באפליקציה. אם ייעשה שימוש בדיוור או הודעות שיווקיות, הדבר ייעשה לפי
            הדין ובאפשרות המשתמש לבקש להפסיק לקבל הודעות כאלה. אנו עשויים לעדכן
            מדיניות זו מעת לעת; שינוי מהותי יופיע בעמוד זה, ובמידת הצורך תישלח
            הודעה באמצעי הקשר שמסר המשתמש.
          </p>
        </section>

        <section className="relative z-10 mt-8 rounded-lg border border-white/22 bg-slate-950/28 p-6 backdrop-blur md:p-8">
          <h2 className="text-2xl font-bold text-white">יצירת קשר</h2>
          <p className="mt-4 leading-8 text-white/78">
            לשאלות, בקשות עיון, תיקון או מחיקה של מידע אישי, אפשר לפנות אלינו
            דרך פרטי הקשר שיופיעו באתר או דרך ערוץ התמיכה הרשמי של דרך חדשה.
            מומלץ לציין בפנייה את כתובת האימייל של החשבון כדי שנוכל לאתר את
            המידע הרלוונטי ולטפל בבקשה.
          </p>
        </section>
      </div>
    </div>
  );
}
