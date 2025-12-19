"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function FollowButton({
  userId,
  username,
}: {
  userId: string
  username: string
}) {
  const router = useRouter()
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      if (user && user.id !== userId) {
        const { data } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .single()
        setFollowing(!!data)
      }
    }
    getUser()
  }, [userId])

  const handleFollow = async () => {
    if (!currentUserId || currentUserId === userId) return

    setLoading(true)
    try {
      if (following) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId)
        setFollowing(false)
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: currentUserId,
            following_id: userId,
          })

        await supabase
          .from('notifications')
          .insert({
            receiver_id: userId,
            sender_id: currentUserId,
            type: 'follow',
            post_id: null,
          })

        setFollowing(true)
      }
      router.refresh()
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!currentUserId || currentUserId === userId) {
    return null
  }

  return (
    <Button
      variant={following ? 'outline' : 'default'}
      size="sm"
      onClick={handleFollow}
      disabled={loading}
    >
      {following ? 'Unfollow' : 'Follow'}
    </Button>
  )
}

