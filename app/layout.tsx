import "./globals.css";
import { assistant } from "./fonts";
import Header from "@/components/layout/Header";
import AuthHandler from "@/components/auth/AuthHandler";
import type { Metadata } from "next";
import ClientMotionProvider from "@/components/ClientMotionProvider"; // ← חדש

export const metadata: Metadata = {
  title: "דרך חדשה",
  description: "My Next.js App",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-180.png",
  },
  manifest: "/manifest.json",
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
      <body className={`${assistant.className} bg-background text-foreground`}>
        <ClientMotionProvider>
          <Header />
          <AuthHandler />
          <main className="min-h-screen pt-24">{children}</main>
        </ClientMotionProvider>
      </body>
    </html>
  );
}
