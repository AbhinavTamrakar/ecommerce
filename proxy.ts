import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = [
  '/account',
  '/orders',
  '/checkout',
  '/paypal/return',
]

const guestOnlyRoutes = [
  '/login',
  '/register',
]

function isValidToken(token: string | undefined): boolean {
  if (!token) return false
  if (token.trim() === '') return false

  // Basic JWT structure check: must have 3 parts separated by dots
  const parts = token.split('.')
  if (parts.length !== 3) return false

  // Check each part is non-empty base64url string
  const base64urlRegex = /^[A-Za-z0-9_-]+$/
  if (!parts.every((part) => part.length > 0 && base64urlRegex.test(part))) return false

  // Check token is not expired by decoding the payload
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp && Date.now() / 1000 > payload.exp) return false
  } catch {
    // If payload can't be decoded, treat as invalid
    return false
  }

  return true
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token = req.cookies.get('token')?.value
  const isLoggedIn = isValidToken(token)

  // If token exists but is invalid/expired, clear the cookie and redirect to login
  if (token && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('token')
    return response
  }

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const isGuestOnly = guestOnlyRoutes.some((route) => pathname.startsWith(route))
  if (isGuestOnly && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/account/:path*',
    '/account',
    '/orders/:path*',
    '/checkout/:path*',
    '/login',
    '/register',
    '/paypal/return',
  ],
}