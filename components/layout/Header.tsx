"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import LogoIcon from "@/components/layout/logo";
import { LogIn, LogOut } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<Session["user"] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!supabase?.auth) {
      console.error("Supabase auth client not initialized");
      setLoading(false);
      return;
    }

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
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary backdrop-blur-md shadow-md py-4 border-b border-white/40">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          {/* <Image
            src="/logo2.png"
            alt="Career Diagnosis Logo"
            width={220}
            height={60}
            className="h-16 w-auto"
            priority
          /> */}
          <Image
            src="/logo1.svg"
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
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-white text-sm">
                {user.email}
              </span>
              <button onClick={handleSignOut} aria-label="התנתק" title="התנתק">
                <LogOut className="h-6 w-6 cursor-pointer text-white" />
              </button>
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
