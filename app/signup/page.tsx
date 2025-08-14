"use client"

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
import { useRouter } from "next/navigation"
import { useState } from "react"
import supabase from "@/lib/supabase"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleGoogleSignup = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    // Determine the correct redirect URL based on environment
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const redirectUrl = isDevelopment 
      ? 'http://localhost:3000/auth/callback-client'
      : `${window.location.origin}/auth/callback-client`;
    
    console.log('Initiating Google OAuth signup with redirect to:', redirectUrl);
    console.log('Environment:', isDevelopment ? 'development' : 'production');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })
      
      if (error) throw error
    } catch (error: any) {
      console.error('Google signup error:', error)
      setError(error.message || 'שגיאה בהרשמה עם Google')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm-password') as string
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('אנא מלא את כל השדות')
      setIsLoading(false)
      return
    }
    
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות')
      setIsLoading(false)
      return
    }
    
    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים')
      setIsLoading(false)
      return
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback-client`
        }
      })
      
      if (error) throw error
      
      if (data.user && !data.user.email_confirmed_at) {
        setSuccess(true)
      } else {
        // User is confirmed, redirect to dashboard or home
        router.push('/')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      setError(error.message || 'שגיאה בהרשמה')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">הרשמה</CardTitle>
            <CardDescription>
              הזן את הפרטים שלך למטה כדי ליצור חשבון חדש
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800 font-medium">ההרשמה הושלמה בהצלחה!</p>
                  <p className="text-green-600 text-sm mt-1">
                    נשלח אליך אימייל אישור. אנא לחץ על הקישור באימייל כדי להפעיל את החשבון.
                  </p>
                </div>
                <Link href="/signin" className="text-blue-600 hover:underline">
                  חזור לדף ההתחברות
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}
                <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">שם מלא</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="ישראל ישראלי"
                    required
                  />
                </div>
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
                  <Label htmlFor="password">סיסמה</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirm-password">אישור סיסמה</Label>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'יוצר חשבון...' : 'צור חשבון'}
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
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                >
                  {isLoading ? 'מתחבר...' : 'הרשם עם Google'}
                </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  כבר יש לך חשבון?{" "}
                  <Link href="/signin" className="underline underline-offset-4">
                    התחבר
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
