import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = [
  '/account',
  '/orders',
  '/checkout',
  '/cart',
]

const guestOnlyRoutes = [
  '/login',
  '/register',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token = req.cookies.get('token')?.value
  const isLoggedIn = !!token

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
    '/cart/:path*',
    '/cart',
    '/register',
  ],
}