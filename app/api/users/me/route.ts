import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseClient'

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const formData = await request.formData()
    const full_name = formData.get('full_name') as string
    const bio = formData.get('bio') as string
    const website = formData.get('website') as string
    const location = formData.get('location') as string
    const profile_visibility = formData.get('profile_visibility') as string
    const avatarFile = formData.get('avatar') as File | null

    const supabase = createServerClient()

    let avatarUrl = null
    if (avatarFile && avatarFile.size > 0) {
      const fileExt = avatarFile.name.split('.').pop()?.toLowerCase()
      if (fileExt && ['jpg', 'jpeg', 'png'].includes(fileExt)) {
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const arrayBuffer = await avatarFile.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, uint8Array, {
            contentType: avatarFile.type || `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
            upsert: true,
          })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)
          avatarUrl = urlData.publicUrl
        } else {
          console.error('Avatar upload error:', uploadError)
          return NextResponse.json(
            { error: `Failed to upload avatar: ${uploadError.message}` },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Only JPEG and PNG images are allowed' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (full_name !== null) updateData.full_name = full_name
    if (bio !== null) {
      if (bio.length > 160) {
        return NextResponse.json(
          { error: 'Bio must be 160 characters or less' },
          { status: 400 }
        )
      }
      updateData.bio = bio
    }
    if (website !== null) updateData.website = website
    if (location !== null) updateData.location = location
    if (profile_visibility !== null) updateData.profile_visibility = profile_visibility
    if (avatarUrl) updateData.avatar_url = avatarUrl

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
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
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}

