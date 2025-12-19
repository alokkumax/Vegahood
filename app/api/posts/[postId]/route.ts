import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseClient'

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', params.postId)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const user = await requireAuth()
    const { content, category, is_active } = await request.json()

    const supabase = createServerClient()

    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', params.postId)
      .single()

    if (!post || post.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (content !== undefined) {
      if (content.length > 280) {
        return NextResponse.json(
          { error: 'Content must be 280 characters or less' },
          { status: 400 }
        )
      }
      updateData.content = content
    }
    if (category !== undefined) {
      updateData.category = category
    }
    if (is_active !== undefined) {
      updateData.is_active = is_active
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', params.postId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const user = await requireAuth()

    const supabase = createServerClient()

    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', params.postId)
      .single()

    if (!post || post.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('posts')
      .update({ is_active: false })
      .eq('id', params.postId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete post' },
      { status: 500 }
    )
  }
}

