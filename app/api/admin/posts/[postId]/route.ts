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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await requireAdmin()
    await checkAdminUnlocked()

    const supabase = createServerClient()

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

