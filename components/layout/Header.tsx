"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import {
  ChevronDown,
  FileText,
  LogIn,
  LogOut,
  Mail,
  UserRound,
} from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<Session["user"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!supabase?.auth) {
      console.error("Supabase auth client not initialized");
      setLoading(false);
      return;
    }

    const loadingFallback = window.setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        window.clearTimeout(loadingFallback);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: string, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      window.clearTimeout(loadingFallback);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      setIsProfileOpen(false);
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSignIn = () => {
    router.push("/signin");
  };

  return (
    <header className="liquid-glass-header fixed top-0 left-0 right-0 z-50 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center"
          aria-label={user ? "דרך חדשה - מעבר לדשבורד" : "דרך חדשה - דף הבית"}
        >
          <Image
            src="/logo-inline-white.svg"
            alt=""
            width={200}
            height={40}
            className="h-20 w-auto"
            priority
          />
        </Link>
        <nav className="flex space-x-8 items-center">
          {/* <Link href="/aboutHolland" className="text-white hover:text-gray-200 transition-colors">
            אודות השאלון
          </Link> */}
          {loading ? (
            <div className="text-white">טוען...</div>
          ) : user ? (
            <div className="relative">
              <button
                type="button"
                className="flex h-11 items-center gap-2 rounded-full border border-white/35 bg-white/10 px-2.5 text-white shadow-sm transition hover:bg-white/15"
                aria-label="תפריט פרופיל"
                aria-expanded={isProfileOpen}
                aria-haspopup="menu"
                onClick={() => setIsProfileOpen((open) => !open)}
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-white text-primary">
                  <UserRound className="size-4" />
                </span>
                <ChevronDown
                  className={`size-4 transition-transform ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProfileOpen ? (
                <div
                  role="menu"
                  className="absolute left-0 mt-3 w-72 overflow-hidden rounded-lg border border-white/25 bg-slate-950/85 text-white shadow-2xl shadow-blue-950/30 backdrop-blur-xl"
                >
                  <div className="border-b border-white/15 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                      <Mail className="size-3.5" />
                      חשבון
                    </div>
                    <p className="mt-1 truncate text-sm" dir="ltr">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-white/10"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <FileText className="size-4" />
                    <span>פרופיל ותוצאות</span>
                  </Link>

                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 px-4 py-3 text-right text-sm text-red-100 transition hover:bg-red-500/15"
                    onClick={handleSignOut}
                  >
                    <LogOut className="size-4" />
                    <span>התנתק</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button onClick={handleSignIn} aria-label="התחבר" title="התחבר">
              <LogIn className="h-6 w-6 cursor-pointer text-white" />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
