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

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await requireAdmin()
    await checkAdminUnlocked()

    const supabase = createServerClient()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { data: followers } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', params.userId)

    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', params.userId)

    const { data: posts } = await supabase
      .from('posts')
      .select('id')
      .eq('author_id', params.userId)

    return NextResponse.json({
      ...profile,
      follower_count: followers?.length || 0,
      following_count: following?.length || 0,
      posts_count: posts?.length || 0,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

