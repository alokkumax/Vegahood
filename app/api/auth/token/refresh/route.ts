import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json({
      session: data.session,
      user: data.user,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Token refresh failed' },
      { status: 500 }
    )
  }
}

