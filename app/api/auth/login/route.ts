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

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

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
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', email_or_username)
          .maybeSingle()

        if (profileError) {
          console.error('Profile lookup error:', {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint
          })
          
          if (profileError.code === 'PGRST301' || profileError.message?.includes('permission') || profileError.message?.includes('policy')) {
            return NextResponse.json(
              { error: 'Username lookup not available. Please use your email address to login.' },
              { status: 401 }
            )
          }
        }

        if (profile && profile.email) {
          email = profile.email
        } else {
          return NextResponse.json(
            { error: 'Invalid username or email' },
            { status: 401 }
          )
        }
      } catch (error: any) {
        console.error('Error checking username:', error)
        return NextResponse.json(
          { error: 'Unable to verify username. Please use your email address to login.' },
          { status: 401 }
        )
      }
    }

    console.log('Attempting login with email:', email.substring(0, 3) + '***')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', {
        message: error.message,
        status: error.status,
        name: error.name
      })
      return NextResponse.json(
        { error: error.message || 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!data.session) {
      console.error('No session created after login')
      return NextResponse.json(
        { error: 'Login failed - no session created' },
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

