import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('Middleware called:', { 
    url: req.url,
    pathname: req.nextUrl.pathname
  });

  const res = NextResponse.next();
  
  try {
    console.log('Middleware environment:', {
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV
    });
    
    console.log('Creating Supabase client in middleware...');
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => req.cookies.get(name)?.value,
          set: (name: string, value: string, options: any) => {
            res.cookies.set(name, value, options);
          },
          remove: (name: string, options: any) => {
            res.cookies.set(name, '', { ...options, maxAge: 0 });
          },
        },
      }
    );
    
    console.log('Getting session in middleware...');
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Session check result:', { 
      hasSession: !!session,
      error: error || 'none'
    });
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
