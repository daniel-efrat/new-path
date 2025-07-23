"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import LogoIcon from "@/components/layout/logo"

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleSignIn = () => {
    router.push("/signin")
  }
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md shadow-md py-4 border-b border-white/40">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo2.png"
            alt="Career Diagnosis Logo"
            width={220}
            height={60}
            className="h-16 w-auto"
            priority
          />
          {/* <LogoIcon className="h-22 w-auto" /> */}
        </Link>
        <nav className="flex space-x-8 items-center">
          {loading ? (
            <div className="text-gray-500">טוען...</div>
          ) : user ? (
            <div className="flex flex-col items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="p-2 rounded-full hover:bg-red-100 transition-colors"
                aria-label="התנתק"
                title="התנתק"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                  />
                </svg>
              </button>
              {/* <span className="text-muted-foreground text-sm">
                {user.email}
              </span> */}
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="p-2 rounded-full hover:bg-blue-100 transition-colors"
              aria-label="התחבר"
              title="התחבר"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8V7a2 2 0 012-2h4a2 2 0 012 2v1m-6 8v1a2 2 0 002 2h4a2 2 0 002-2v-1m-6-4h8"
                />
              </svg>
            </button>
          )}
        </nav>
        {/* <div className="md:hidden">
          <button className="text-gray-700 hover:text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div> */}
      </div>
    </header>
  )
}
