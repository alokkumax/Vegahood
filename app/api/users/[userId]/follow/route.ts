import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseClient'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await requireAuth()

    if (user.id === params.userId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: params.userId,
      })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Already following' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    await supabase
      .from('notifications')
      .insert({
        receiver_id: params.userId,
        sender_id: user.id,
        type: 'follow',
        post_id: null,
      })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to follow user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await requireAuth()

    const supabase = createServerClient()

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', params.userId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to unfollow user' },
      { status: 500 }
    )
  }
}

