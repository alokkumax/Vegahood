"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import LikeButton from './LikeButton'
import CommentBox from './CommentBox'
import { Post } from '@/types'
import { supabase } from '@/lib/supabaseClient'

export default function PostCard({ post }: { post: Post }) {
  const [author, setAuthor] = useState<any>(null)

  useEffect(() => {
    const loadAuthor = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', post.author_id)
        .single()
      setAuthor(data)
    }
    loadAuthor()
  }, [post.author_id])

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link href={`/profile/${author?.username}`}>
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarImage src={author?.avatar_url || undefined} alt={author?.username} />
              <AvatarFallback className="text-xs sm:text-sm">
                {author?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${author?.username}`} className="font-semibold hover:underline text-sm sm:text-base">
              {author?.username}
            </Link>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {timeAgo(post.created_at)}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">{post.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        <p className="whitespace-pre-wrap text-sm sm:text-base">{post.content}</p>
        {post.image_url && (
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
            <Image
              src={post.image_url}
              alt="Post image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="flex items-center space-x-4 sm:space-x-6 pt-2 border-t">
          <LikeButton postId={post.id} initialLiked={false} initialCount={post.like_count} />
          <CommentBox postId={post.id} initialCount={post.comment_count} />
        </div>
      </CardContent>
    </Card>
  )
}

