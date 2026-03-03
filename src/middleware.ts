import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuth = !!token
  const pathname = req.nextUrl.pathname

  // Pages publiques accessibles sans authentification
  const publicPages = [
    '/',
    '/login',
    '/register',
    '/cgu',
    '/confidentialite',
    '/cookies',
    '/mentions-legales',
    '/mineurs',
    '/transferts-donnees'
  ]

  // Si la page est publique, autoriser l'accès
  if (publicPages.includes(pathname)) {
    return NextResponse.next()
  }

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une page protégée
  if (!isAuth) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|api/users|_next/static|_next/image|favicon.ico|robots.txt|login|register|cgu|confidentialite|cookies|mentions-legales|mineurs|transferts-donnees|/).*)'
  ]
}
