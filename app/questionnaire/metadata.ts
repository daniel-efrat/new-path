import { Metadata } from "next"

export const metadata: Metadata = {
  title: "שאלון אבחון תעסוקתי | Career Path",
  description: "מלא את השאלון כדי לקבל המלצות מותאמות אישית למסלול הקריירה שלך",
  openGraph: {
    title: "שאלון אבחון תעסוקתי",
    description: "קבל המלצות מותאמות אישית למסלול הקריירה שלך",
    type: "website",
    locale: "he_IL",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
}
