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
      .select('follower_id, created_at')
      .eq('following_id', params.userId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    const followerIds = data?.map(f => f.follower_id) || []
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', followerIds)

    return NextResponse.json(profiles || [])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch followers' },
      { status: 500 }
    )
  }
}

