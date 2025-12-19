import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    })

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
    }

      return NextResponse.redirect(new URL('/feed', request.url))
  }

  if (token_hash && type) {
    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    })
    
    if (type === 'signup' || type === 'email_change' || type === 'email') {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type === 'signup' ? 'signup' : type === 'email_change' ? 'email_change' : 'email',
      })

      if (error) {
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
      }

      return NextResponse.redirect(new URL('/feed', request.url))
    }
  }

  return NextResponse.redirect(new URL('/login', request.url))
}

