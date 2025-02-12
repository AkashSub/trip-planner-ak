import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add console.log for debugging
  console.log('Middleware:', request.nextUrl.pathname)
  
  const user = request.cookies.get('user')
  
  // If user is not logged in and trying to access any page other than login
  if (!user && request.nextUrl.pathname !== '/login') {
    console.log('Redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}