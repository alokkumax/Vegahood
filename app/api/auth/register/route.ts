import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, username, full_name, password, bio } = await request.json()

    if (!email || !username || !full_name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        )
      }
    } catch (checkError: any) {
      console.error('Error checking username (will proceed with signup):', checkError)
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name,
          bio: bio || null,
          avatar_url: null,
        },
        emailRedirectTo: `${request.nextUrl.origin}/auth/confirm`,
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    await new Promise(resolve => setTimeout(resolve, 1500))

    const { error: updateError } = await supabase.rpc('update_profile_after_signup', {
      p_user_id: authData.user.id,
      p_username: username,
      p_email: email,
      p_full_name: full_name,
      p_bio: bio || null,
      p_avatar_url: null,
    })

    if (updateError) {
      console.error('Profile update error:', updateError)
      if (updateError.message?.includes('unique') || updateError.message?.includes('username')) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        )
      }
    }

    const response = NextResponse.json({
      user: authData.user,
      session: authData.session,
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
      { error: error.message || 'Registration failed' },
      { status: 500 }
    )
  }
}

