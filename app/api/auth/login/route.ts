import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const { email_or_username, password } = await request.json()

    if (!email_or_username || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
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

    return NextResponse.json({
      user: data.user,
      session: data.session,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}

