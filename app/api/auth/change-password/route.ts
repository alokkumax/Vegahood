import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
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
      { error: error.message || 'Change password failed' },
      { status: 500 }
    )
  }
}

