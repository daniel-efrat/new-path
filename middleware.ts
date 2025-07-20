import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Protect dashboard route
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Get all cookies and check for specific auth cookies
    const cookies = request.cookies.getAll()
    const accessToken = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value
    
    // Also check for standard Supabase cookies
    const authCookies = cookies.filter(cookie => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('sb-') ||
      cookie.name.includes('auth-token')
    )
    
    console.log('Middleware dashboard access check:', {
      pathname: request.nextUrl.pathname,
      totalCookies: cookies.length,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      authCookies: authCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      allCookieNames: cookies.map(c => c.name)
    })

    // Check for specific auth tokens or any auth-related cookies
    const hasAuth = accessToken || refreshToken || authCookies.length > 0
    
    // Temporarily disable middleware protection for debugging
    if (!hasAuth) {
      console.log('No auth found, but allowing access for debugging')
      // Uncomment the next 5 lines to re-enable protection:
      // const redirectUrl = request.nextUrl.clone()
      // redirectUrl.pathname = "/signin"
      // redirectUrl.searchParams.set("from", request.nextUrl.pathname)
      // return NextResponse.redirect(redirectUrl)
    }
    
    console.log('Allowing access to dashboard')
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
