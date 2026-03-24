// Middleware temporairement désactivé pour debug CLI
import { NextRequest, NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // DÉSACTIVÉ TEMPORAIREMENT - Autoriser toutes les requêtes
  console.log('🔓 Middleware désactivé temporairement pour debug CLI')
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|api/users|api/cli|api/debug|_next/static|_next/image|favicon.ico|robots.txt|login|register|cgu|confidentialite|cookies|mentions-legales|mineurs|transferts-donnees|/).*)'
  ]
}
