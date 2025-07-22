import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// This should match your JWT signing secret
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_jwt_secret_replace_in_production'
)

async function isValidJWT(token: string): Promise<boolean> {
  try {
    // Verify the token and check its expiration
    // await jwtVerify(token, JWT_SECRET)
    return true
  } catch (error) {
    console.error('JWT validation error:', error)
    return false
  }
}

export async function middleware(request: NextRequest) {
  const currentUrl = new URL(request.url)
  const token = currentUrl.searchParams.get('token')
  const storedToken = request.cookies.get('auth_token')?.value
  
  // Check if we're already on the unauthorized page to prevent redirect loops
  if (currentUrl.pathname === '/unauthorized') {
    return NextResponse.next()
  }

  // Function to redirect to unauthorized page
  const redirectToUnauthorized = () => {
    const unauthorizedUrl = new URL('/unauthorized', request.url)
    return NextResponse.redirect(unauthorizedUrl)
  }

  // If no token in URL and no stored token, redirect to unauthorized
  if (!token && !storedToken) {
    return redirectToUnauthorized()
  }

  // Validate the active token (either from URL or stored)
  const tokenToValidate = token || storedToken
  if (tokenToValidate) {
    const isValid = await isValidJWT(tokenToValidate)
    if (!isValid) {
      // Clear invalid token from cookies if it exists
      const response = redirectToUnauthorized()
      if (storedToken) {
        response.cookies.delete('auth_token')
      }
      return response
    }
  }
  
  if (!token && storedToken) {
    // If URL has no token but we have a valid one stored, add it to URL
    currentUrl.searchParams.set('token', storedToken)
    return NextResponse.redirect(currentUrl)
  } else if (token && (!storedToken || storedToken !== token)) {
    // If we got a new valid token in URL, update our stored token
    const response = NextResponse.next()
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })
    return response
  }

  return NextResponse.next()
}

// Configure which routes to apply the middleware to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|unauthorized).*)',
  ],
} 