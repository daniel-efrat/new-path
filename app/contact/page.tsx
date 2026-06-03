import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "צור קשר | דרך חדשה",
  description:
    "יצירת קשר עם דרך חדשה: טלפון, אימייל וטופס פנייה בנושא הכוונה תעסוקתית וקריירה.",
};

const contactMethods = [
  {
    label: "טלפון",
    value: "052-3417805",
    href: "tel:0523417805",
    icon: Phone,
  },
  {
    label: "אימייל",
    value: "ratzimor@013.net",
    href: "mailto:ratzimor@013.net",
    icon: Mail,
  },
  {
    label: "פריסה",
    value: "מכון בפריסה ארצית",
    href: null,
    icon: MapPin,
  },
];

export default function ContactPage() {
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
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold text-white/75">
                דרך חדשה
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl">
                צור קשר
              </h1>
              <p className="mt-5 text-lg leading-8 text-white/82">
                נשמח לשמוע ממך לגבי אבחון, הכוונה תעסוקתית, תוצאות שאלון או
                התאמת מסלול קריירה. אפשר לפנות בטלפון, באימייל או להשאיר פרטים
                ונחזור אליך בהקדם.
              </p>

              <div className="mt-8 grid gap-3">
                {contactMethods.map((method) => {
                  const Icon = method.icon;
                  const content = (
                    <div className="flex items-center gap-3 rounded-lg border border-white/18 bg-white/9 p-4 text-white transition hover:bg-white/14">
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-sm text-white/62">{method.label}</p>
                        <p className="text-lg font-semibold">{method.value}</p>
                      </div>
                    </div>
                  );

                  return method.href ? (
                    <Link key={method.label} href={method.href}>
                      {content}
                    </Link>
                  ) : (
                    <div key={method.label}>{content}</div>
                  );
                })}
              </div>
            </div>

            <ContactForm />
          </div>
        </section>
      </div>
    </div>
  );
}
