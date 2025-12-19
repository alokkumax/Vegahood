"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import FollowButton from './FollowButton'

interface UserListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  userId?: string
  type: 'followers' | 'following' | 'likes'
  postId?: string
}

interface User {
  id: string
  username: string
  full_name?: string
  avatar_url?: string
  bio?: string
}

export default function UserListModal({
  open,
  onOpenChange,
  title,
  userId,
  type,
  postId,
}: UserListModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadUsers()
    } else {
      setUsers([])
    }
  }, [open, userId, type, postId])

  const loadUsers = async () => {
    setLoading(true)
    try {
      if (type === 'followers' && userId) {
        const { data: follows } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', userId)

        if (follows && follows.length > 0) {
          const followerIds = follows.map(f => f.follower_id)
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, bio')
            .in('id', followerIds)
          setUsers(profiles || [])
        } else {
          setUsers([])
        }
      } else if (type === 'following' && userId) {
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId)

        if (follows && follows.length > 0) {
          const followingIds = follows.map(f => f.following_id)
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, bio')
            .in('id', followingIds)
          setUsers(profiles || [])
        } else {
          setUsers([])
        }
      } else if (type === 'likes' && postId) {
        const { data: likes } = await supabase
          .from('likes')
          .select('user_id')
          .eq('post_id', postId)

        if (likes && likes.length > 0) {
          const userIds = likes.map(l => l.user_id)
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, bio')
            .in('id', userIds)
          setUsers(profiles || [])
        } else {
          setUsers([])
        }
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No {title.toLowerCase()}</div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-accent rounded-lg transition-colors">
                <Link href={`/profile/${user.username}`} className="flex-shrink-0">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                    <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${user.username}`}
                    className="font-semibold hover:underline block"
                  >
                    {user.username}
                  </Link>
                  {user.full_name && (
                    <div className="text-sm text-muted-foreground truncate">{user.full_name}</div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <FollowButton userId={user.id} username={user.username} />
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

