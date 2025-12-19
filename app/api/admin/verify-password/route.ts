import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const { password } = await request.json()
    const adminPassword = process.env.ADMIN_PANEL_PASSWORD

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      )
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set('admin_unlocked', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    )
  }
}

