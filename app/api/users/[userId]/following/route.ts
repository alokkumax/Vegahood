import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('follows')
      .select('following_id, created_at')
      .eq('follower_id', params.userId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    const followingIds = data?.map(f => f.following_id) || []
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', followingIds)

    return NextResponse.json(profiles || [])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch following' },
      { status: 500 }
    )
  }
}

