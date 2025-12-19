import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const code = searchParams.get('code')

    if (!token_hash && !code) {
      return NextResponse.json(
        { error: 'Invalid reset link' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      if (data?.session) {
        return NextResponse.json({ success: true, verified: true })
      }
    } else if (token_hash && type === 'recovery') {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'recovery',
      })
      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      if (data?.session) {
        return NextResponse.json({ success: true, verified: true })
      }
    }

    return NextResponse.json(
      { error: 'Invalid reset link' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    )
  }
}

