import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('Auth callback called', { url: request.url });
  
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  
  const origin = new URL(request.url).origin;
  
  console.log('Auth callback params:', {
    code: code ? 'present' : 'missing',
    next,
    origin,
    fullUrl: request.url
  });
  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('Attempting to exchange code for session...');
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      console.log('Exchange response:', {
        success: !error,
        hasSession: !!data?.session,
        error: error || 'none'
      });
      if (!error && data.session) {
        // Create response with redirect using baseUrl
        const response = NextResponse.redirect(`${origin}${next}`)
        
        console.log('Setting auth cookies...');
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
        return NextResponse.redirect(`${origin}/signin?error=callback_error`);
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/signin?error=callback_error`);
    }
  }

  // No code provided, redirect to signin
  return NextResponse.redirect(`${origin}/signin`);
}
