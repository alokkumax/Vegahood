import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const { access_token, password } = await request.json()

    if (!access_token || !password) {
      return NextResponse.json(
        { error: 'Access token and password are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Password reset confirmation failed' },
      { status: 500 }
    )
  }
}

