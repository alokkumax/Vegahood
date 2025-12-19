import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password')
  const isResetPassword = pathname.startsWith('/reset-password')
  const isAuthCallback = pathname.startsWith('/auth/callback') || pathname.startsWith('/auth/confirm')
  const isProtectedRoute = pathname.startsWith('/feed') || 
                          pathname.startsWith('/profile') || 
                          pathname.startsWith('/search') ||
                          pathname.startsWith('/admin') ||
                          pathname.startsWith('/posts')

  if (isAuthCallback) {
    return response
  }

  if (isResetPassword) {
    return response
  }

  if (isAuthPage && session) {
    const redirectResponse = NextResponse.redirect(new URL('/feed', request.url))
    return redirectResponse
  }

  if (isProtectedRoute && !session) {
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

