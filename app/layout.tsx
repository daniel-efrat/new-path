import "./globals.css";
import { assistant } from "./fonts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthHandler from "@/components/auth/AuthHandler";
import type { Metadata } from "next";
import ClientMotionProvider from "@/components/ClientMotionProvider"; // ← חדש

export const metadata: Metadata = {
  title: "דרך חדשה",
  description: "My Next.js App",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/pwa/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/pwa/icons/icon-180.png",
  },
  manifest: "/pwa/manifest.json",
};

export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-title" content="דרך חדשה" />
      </head>
      <body className={`${assistant.className} flex min-h-screen flex-col bg-background text-foreground`}>
        <ClientMotionProvider>
          <Header />
          <AuthHandler />
          <main className="flex-1 pt-24 bg-tech">{children}</main>
          <Footer />
        </ClientMotionProvider>
        <script>
nl_pos = "bl";
nl_link = "https://new-path.goodstuff.click/accessibility";
nl_color = "green";
nl_compact = "1";
nl_accordion = "1";
nl_dir = "https://new-path-test.vercel.app/nagishli/nagishli_v3_beta/nagishli_beta.js/";
</script>
<script src="https://new-path-test.vercel.app/nagishli/nagishli_v3_beta/nagishli.js?v=3" charSet="utf-8" defer></script>
      </body>
    </html>
  );
}
