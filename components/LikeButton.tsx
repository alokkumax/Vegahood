"use client"

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import UserListModal from './UserListModal'

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: {
  postId: string
  initialLiked: boolean
  initialCount: number
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [likesModalOpen, setLikesModalOpen] = useState(false)

  useEffect(() => {
    const loadLikeData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { count: likeCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
      
      if (likeCount !== null) {
        setCount(likeCount)
      }

      if (user) {
        const { data } = await supabase
          .from('likes')
          .select('user_id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single()

        setLiked(!!data)
      }
    }
    loadLikeData()
  }, [postId])

  const handleLike = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
        setLiked(false)
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id })

        const { data: author } = await supabase
          .from('posts')
          .select('author_id')
          .eq('id', postId)
          .single()

        if (author && author.author_id !== user.id) {
          await supabase
            .from('notifications')
            .insert({
              receiver_id: author.author_id,
              sender_id: user.id,
              type: 'like',
              post_id: postId,
            })
        }

        setLiked(true)
      }

      const { count: likeCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
      
      if (likeCount !== null) {
        setCount(likeCount)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCountClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (count > 0) {
      setLikesModalOpen(true)
    }
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
        {count > 0 && (
          <button
            onClick={handleCountClick}
            className="text-sm font-medium hover:underline cursor-pointer"
          >
            {count} {count === 1 ? 'like' : 'likes'}
          </button>
        )}
      </div>
      <UserListModal
        open={likesModalOpen}
        onOpenChange={setLikesModalOpen}
        title="Likes"
        type="likes"
        postId={postId}
      />
    </>
  )
}

