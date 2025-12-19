import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email_or_username, password } = await request.json()

    if (!email_or_username || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const cookieStore = await cookies()
    const authCookies: Array<{ name: string; value: string; options?: any }> = []

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
            authCookies.push({ name, value, options })
          })
        },
      },
    })

    let email = email_or_username

    if (!email_or_username.includes('@')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', email_or_username)
        .single()

      if (!profile || !profile.email) {
        return NextResponse.json(
          { error: 'Invalid username or email' },
          { status: 401 }
        )
      }
      email = profile.email
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      user: data.user,
      session: data.session,
    })

    authCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, {
        httpOnly: options?.httpOnly ?? true,
        secure: options?.secure ?? process.env.NODE_ENV === 'production',
        sameSite: (options?.sameSite as any) ?? 'lax',
        path: options?.path ?? '/',
        maxAge: options?.maxAge,
      })
    })

    cookieStore.getAll().forEach(cookie => {
      if (cookie.name.startsWith('sb-') || cookie.name.includes('auth')) {
        if (!authCookies.find(c => c.name === cookie.name)) {
          response.cookies.set(cookie.name, cookie.value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          })
        }
      }
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}

