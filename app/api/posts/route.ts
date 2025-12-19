import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getServerSession } from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const session = await getServerSession()
    const formData = await request.formData()
    const content = formData.get('content') as string
    const category = formData.get('category') as string
    const imageFile = formData.get('image') as File | null

    if (!content || content.length > 280) {
      return NextResponse.json(
        { error: 'Content is required and must be 280 characters or less' },
        { status: 400 }
      )
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > 2 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image must be 2MB or less' },
          { status: 400 }
        )
      }

      const fileExt = imageFile.name.split('.').pop()?.toLowerCase()
      if (!fileExt || !['jpg', 'jpeg', 'png'].includes(fileExt)) {
        return NextResponse.json(
          { error: 'Only JPEG and PNG images are allowed' },
          { status: 400 }
        )
      }

      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `posts/${fileName}`

      const arrayBuffer = await imageFile.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, uint8Array, {
          contentType: imageFile.type || `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
          upsert: false,
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        return NextResponse.json(
          { error: `Failed to upload image: ${uploadError.message}. Make sure the 'posts' storage bucket exists and has proper permissions.` },
          { status: 400 }
        )
      }

      const { data: urlData } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath)
      imageUrl = urlData.publicUrl
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        content,
        image_url: imageUrl,
        category: category || 'general',
        is_active: true,
      })
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
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

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

