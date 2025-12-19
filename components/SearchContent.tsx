"use client"

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import FollowButton from './FollowButton'
import { Search } from 'lucide-react'

export default function SearchContent() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)

    debounceTimer.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
          .limit(20)

        if (error) throw error
        setResults(data || [])
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by username or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      {loading && query && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Searching...
        </div>
      )}
      {!loading && query && results.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No users found
        </div>
      )}
      {!loading && query && results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <Card key={user.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Link href={`/profile/${user.username}`} className="flex-shrink-0">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${user.username}`} className="font-semibold hover:underline block">
                      {user.username}
                    </Link>
                    {user.full_name && (
                      <div className="text-sm text-muted-foreground truncate">{user.full_name}</div>
                    )}
                    {user.bio && (
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{user.bio}</div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <FollowButton userId={user.id} username={user.username} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!query && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Start typing to search for users</p>
        </div>
      )}
    </div>
  )
}

