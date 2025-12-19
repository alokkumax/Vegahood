import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const { email, username, full_name, password, bio } = await request.json()

    if (!email || !username || !full_name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      )
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

    return NextResponse.json({
      user: authData.user,
      session: authData.session,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    )
  }
}

