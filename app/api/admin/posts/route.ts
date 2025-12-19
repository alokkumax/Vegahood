import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

async function checkAdminUnlocked() {
  const cookieStore = await cookies()
  const unlocked = cookieStore.get('admin_unlocked')?.value === 'true'
  if (!unlocked) {
    throw new Error('Admin panel password required')
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    await checkAdminUnlocked()

    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit
    const isActive = searchParams.get('is_active')

    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

