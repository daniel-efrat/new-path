import { createSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('Auth callback called with:', {
    url: request.url,
    code: code ? 'present' : 'missing',
    searchParams: Object.fromEntries(searchParams.entries()),
    next
  })

  if (code) {
    const supabase = createSupabaseClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error && data.session) {
        // Create response with redirect
        const response = NextResponse.redirect(`${origin}${next}`)
        
        // Set auth cookies manually
        response.cookies.set('sb-access-token', data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: data.session.expires_in
        })
        
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        })
        
        return response
      } else {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/signin?error=callback_error`)
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/signin?error=callback_error`)
    }
  }

  // No code provided, redirect to signin
  return NextResponse.redirect(`${origin}/signin`)
}
