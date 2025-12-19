"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { X, FileImage, Hash, Megaphone, HelpCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'

export default function CreatePostForm({ onPostCreated }: { onPostCreated: () => void }) {
  const { toast } = useToast()
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [category, setCategory] = useState<'general' | 'announcement' | 'question'>('general')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }
    loadProfile()
  }, [])

  useEffect(() => {
    if (image) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(image)
    } else {
      setImagePreview(null)
    }
  }, [image])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('category', category)
      if (image) {
        formData.append('image', image)
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create post')
      }

      toast({
        title: 'Success',
        description: 'Post created successfully',
      })

      setContent('')
      setImage(null)
      setImagePreview(null)
      setCategory('general')
      onPostCreated()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username} />
              <AvatarFallback>
                {profile?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder={`What's on your mind, ${profile?.full_name || profile?.username || ''}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={280}
                rows={2}
                className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base min-h-[60px]"
              />
            </div>
          </div>

          {imagePreview && (
            <div className="relative rounded-lg overflow-hidden border">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-96 object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null)
                  setImagePreview(null)
                }}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 sm:gap-4">
              <label
                htmlFor="image-upload"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                <FileImage className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">Photo</span>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="hidden"
              />
              
              <div className="relative flex items-center group">
                <Label htmlFor="category" className="sr-only">Category</Label>
                <div className="absolute left-2.5 pointer-events-none z-10">
                  {category === 'general' && <Hash className="h-3.5 w-3.5 text-muted-foreground" />}
                  {category === 'announcement' && <Megaphone className="h-3.5 w-3.5 text-muted-foreground" />}
                  {category === 'question' && <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="h-8 rounded-md border border-input bg-background pl-8 pr-8 py-1.5 text-xs sm:text-sm text-foreground appearance-none cursor-pointer hover:bg-accent hover:border-accent-foreground/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all duration-200"
                >
                  <option value="general">General</option>
                  <option value="announcement">Announcement</option>
                  <option value="question">Question</option>
                </select>
                <div className="absolute right-2 pointer-events-none">
                  <svg
                    className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:text-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground hidden sm:block">
                {content.length}/280
              </div>
              <Button 
                type="submit" 
                disabled={loading || !content.trim()}
                className="px-4 sm:px-6 h-8 sm:h-10"
              >
                {loading ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

