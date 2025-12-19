"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Profile } from '@/types'

export default function EditProfileDialog({ profile, onUpdated }: { profile: Profile; onUpdated: () => void }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    bio: profile.bio || '',
    full_name: profile.full_name || '',
    website: profile.website || '',
    location: profile.location || '',
  })
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)

  useEffect(() => {
    setFormData({
      bio: profile.bio || '',
      full_name: profile.full_name || '',
      website: profile.website || '',
      location: profile.location || '',
    })
    setAvatarPreview(profile.avatar_url)
  }, [profile])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('bio', formData.bio)
      formDataToSend.append('full_name', formData.full_name)
      formDataToSend.append('website', formData.website)
      formDataToSend.append('location', formData.location)
      if (avatar) {
        formDataToSend.append('avatar', avatar)
      }

      const res = await fetch('/api/users/me', {
        method: 'PUT',
        body: formDataToSend,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })

      setOpen(false)
      onUpdated()
      router.refresh()
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-24 w-24 rounded-full object-cover border-2"
                />
              ) : (
                <div className="h-24 w-24 rounded-full border-2 bg-muted flex items-center justify-center text-2xl font-semibold">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="w-full">
              <Label htmlFor="avatar">Avatar</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              maxLength={160}
              rows={3}
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {formData.bio.length}/160
            </div>
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              placeholder="City, Country"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

