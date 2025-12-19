"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import PostCard from './PostCard'
import CreatePostForm from './CreatePostForm'
import { Post } from '@/types'

export default function FeedContent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeed()
  }, [])

  const loadFeed = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followingIds = follows?.map(f => f.following_id) || []
      const allIds = [user.id, ...followingIds]

      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .in('author_id', allIds)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setPosts(postsData || [])
    } catch (error) {
      console.error('Error loading feed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <CreatePostForm onPostCreated={loadFeed} />
      {posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No posts yet. Follow some users to see their posts!
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  )
}

