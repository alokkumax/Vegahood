"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function AdminContent() {
  const { toast } = useToast()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'posts'>('stats')

  useEffect(() => {
    checkUnlocked()
  }, [])

  const checkUnlocked = async () => {
    try {
      const res = await fetch('/api/admin/users?limit=1')
      if (res.ok) {
        setUnlocked(true)
        loadStats()
      } else {
        setUnlocked(false)
      }
    } catch {
      setUnlocked(false)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Invalid password')
      }

      setUnlocked(true)
      setPassword('')
      loadStats()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (res.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (res.ok) {
        setUsers(data)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadPosts = async () => {
    try {
      const res = await fetch('/api/admin/posts')
      const data = await res.json()
      if (res.ok) {
        setPosts(data)
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}/deactivate`, {
        method: 'POST',
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'User deactivated',
        })
        loadUsers()
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Post deleted',
        })
        loadPosts()
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!unlocked) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Admin Password Required</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Unlock Admin Panel
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 border-b">
        <Button
          variant={activeTab === 'stats' ? 'default' : 'ghost'}
          onClick={() => {
            setActiveTab('stats')
            loadStats()
          }}
        >
          Stats
        </Button>
        <Button
          variant={activeTab === 'users' ? 'default' : 'ghost'}
          onClick={() => {
            setActiveTab('users')
            loadUsers()
          }}
        >
          Users
        </Button>
        <Button
          variant={activeTab === 'posts' ? 'default' : 'ghost'}
          onClick={() => {
            setActiveTab('posts')
            loadPosts()
          }}
        >
          Posts
        </Button>
      </div>

      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_posts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.active_today}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-semibold">{user.username}</div>
                    <div className="text-sm text-muted-foreground">{user.email || 'N/A'}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(user.is_admin || user.is_super_admin) && <Badge>Admin</Badge>}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeactivateUser(user.id)}
                    >
                      Deactivate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'posts' && (
        <Card>
          <CardHeader>
            <CardTitle>All Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Post ID: {post.id}</div>
                    <div className="mt-1">{post.content.substring(0, 100)}...</div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={post.is_active ? 'default' : 'secondary'}>
                        {post.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

