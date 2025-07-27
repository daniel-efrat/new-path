'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle OAuth callback tokens from URL hash
  useEffect(() => {
    console.log('Signin page loaded with:', {
      hash: window.location.hash,
      search: window.location.search,
      pathname: window.location.pathname,
      href: window.location.href
    });

    // Check if user is already authenticated
    const checkExistingAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Existing session check:', { session, error });
        
        if (session && !error) {
          console.log('User already authenticated, redirecting...');
          const urlParams = new URLSearchParams(window.location.search);
          const from = urlParams.get('from') || '/dashboard';
          router.push(from);
          return;
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    checkExistingAuth();
    
    // Check for tokens in hash
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      console.log('Hash params:', Object.fromEntries(hashParams.entries()));
      
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken) {
        console.log('Processing OAuth tokens from hash...');
        
        const handleAuthCallback = async () => {
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (error) {
              console.error('Session error:', error);
              alert('שגיאה בהתחברות. אנא נסה שוב.');
            } else {
              console.log('Session set successfully:', data);
              console.log('Current cookies:', document.cookie);
              
              // Clear the hash from URL
              window.history.replaceState(null, '', window.location.pathname);
              
              // Wait a moment for cookies to be set, then redirect
              setTimeout(() => {
                console.log('Redirecting after OAuth...');
                const urlParams = new URLSearchParams(window.location.search);
                const from = urlParams.get('from') || '/dashboard';
                window.location.href = from;
              }, 1000);
            }
          } catch (error) {
            console.error('Auth callback error:', error);
            alert('שגיאה בהתחברות. אנא נסה שוב.');
          }
        };
        
        handleAuthCallback();
      }
    }
  }, [router]);

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsGoogleLoading(true);
    
    console.log('Initiating Google OAuth with redirect to:', `${window.location.origin}/signin`);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log('Google OAuth response:', { data, error });

      if (error) {
        console.error('Google login error:', error);
        alert('שגיאה בהתחברות עם Google. אנא נסה שוב.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('שגיאה בהתחברות עם Google. אנא נסה שוב.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        alert('שגיאה בהתחברות. אנא בדוק את פרטי ההתחברות שלך.');
      } else {
        console.log('Login successful, session data:', data);
        // Check for redirect parameter
        const urlParams = new URLSearchParams(window.location.search);
        const from = urlParams.get('from') || '/dashboard';
        console.log('Redirecting to:', from);
        
        // Wait a moment for the session to be properly set
        setTimeout(() => {
          router.push(from);
        }, 500);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('שגיאה בהתחברות. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">התחבר לחשבונך</CardTitle>
            <CardDescription>
              הזן את האימייל שלך למטה כדי להתחבר לחשבונך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">אימייל</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">סיסמה</Label>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    שכחת את הסיסמה?
                  </a>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "מתחבר..." : "התחבר"}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      או
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? "מתחבר..." : "התחבר עם Google"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                אין לך חשבון?{" "}
                <Link href="/signup" className="underline underline-offset-4">
                  הירשם
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
