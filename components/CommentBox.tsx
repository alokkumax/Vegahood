"use client"

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabaseClient'
import { Comment } from '@/types'
import Link from 'next/link'

export default function CommentBox({
  postId,
  initialCount,
}: {
  postId: string
  initialCount: number
}) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<(Comment & { username?: string; avatar_url?: string })[]>([])
  const [commentText, setCommentText] = useState('')
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCommentCount()
  }, [postId])

  useEffect(() => {
    if (open) {
      loadComments()
    }
  }, [open, postId])

  const loadCommentCount = async () => {
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
    
    if (count !== null) {
      setCount(count)
    }
  }

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (data) {
      const commentsWithUsers = await Promise.all(
        data.map(async (comment) => {
          const { data: user } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', comment.user_id)
            .single()
          return { ...comment, username: user?.username, avatar_url: user?.avatar_url }
        })
      )
      setComments(commentsWithUsers)
      setCount(commentsWithUsers.length)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: commentText,
        })

      if (error) throw error

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
            type: 'comment',
            post_id: postId,
          })
      }

      setCommentText('')
      await loadComments()
      await loadCommentCount()
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <MessageCircle className="h-4 w-4" />
          <span>{count}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Link href={`/profile/${comment.username}`}>
                  <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={comment.avatar_url || undefined} alt={comment.username} />
                    <AvatarFallback>{comment.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <Link 
                    href={`/profile/${comment.username}`}
                    className="font-semibold text-sm hover:underline cursor-pointer"
                  >
                    {comment.username}
                  </Link>
                  <div className="text-sm">{comment.content}</div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={2}
            />
            <Button type="submit" disabled={loading || !commentText.trim()}>
              {loading ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

