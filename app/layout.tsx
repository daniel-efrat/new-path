"use client"

import { Assistant } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"

const assistant = Assistant({ subsets: ["hebrew", "latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${assistant.className} bg-background text-foreground`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
