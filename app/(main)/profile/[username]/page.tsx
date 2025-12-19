import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import { createServerClient } from '@/lib/supabaseClient'
import ProfileContent from '@/components/ProfileContent'

export default async function ProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const currentProfile = await getCurrentProfile()
  
  if (!currentProfile) {
    redirect('/login')
  }

  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profile) {
    return <div className="max-w-2xl mx-auto px-4 py-8">User not found</div>
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', profile.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const { data: followers } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', profile.id)

  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', profile.id)

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <ProfileContent
        profile={profile}
        posts={posts || []}
        followerCount={followers?.length || 0}
        followingCount={following?.length || 0}
        isOwnProfile={currentProfile.id === profile.id}
      />
    </div>
  )
}

