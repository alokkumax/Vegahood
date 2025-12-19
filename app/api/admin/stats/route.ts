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

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    const { count: activeToday } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('created_at', todayISO)

    return NextResponse.json({
      total_users: totalUsers || 0,
      total_posts: totalPosts || 0,
      active_today: activeToday || 0,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

