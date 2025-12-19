"use client"

import { useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import PostCard from './PostCard'
import FollowButton from './FollowButton'
import EditProfileDialog from './EditProfileDialog'
import UserListModal from './UserListModal'
import { Profile, Post } from '@/types'
import Link from 'next/link'
import Image from 'next/image'

export default function ProfileContent({
  profile: initialProfile,
  posts,
  followerCount,
  followingCount,
  isOwnProfile,
}: {
  profile: Profile
  posts: Post[]
  followerCount: number
  followingCount: number
  isOwnProfile: boolean
}) {
  const [profile, setProfile] = useState(initialProfile)
  const [followersModalOpen, setFollowersModalOpen] = useState(false)
  const [followingModalOpen, setFollowingModalOpen] = useState(false)

  const handleProfileUpdated = () => {
    window.location.reload()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mx-auto sm:mx-0">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
              <AvatarFallback className="text-xl sm:text-2xl">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold">{profile.username}</h1>
                {isOwnProfile ? (
                  <EditProfileDialog profile={profile} onUpdated={handleProfileUpdated} />
                ) : (
                  <FollowButton userId={profile.id} username={profile.username} />
                )}
              </div>
              {profile.full_name && (
                <div className="font-semibold mb-2">{profile.full_name}</div>
              )}
              <div className="flex justify-center sm:justify-start space-x-4 sm:space-x-6 mb-4">
                <div>
                  <span className="font-semibold">{posts.length}</span> posts
                </div>
                <button
                  onClick={() => setFollowersModalOpen(true)}
                  className="hover:opacity-70 transition-opacity cursor-pointer"
                >
                  <span className="font-semibold">{followerCount}</span> followers
                </button>
                <button
                  onClick={() => setFollowingModalOpen(true)}
                  className="hover:opacity-70 transition-opacity cursor-pointer"
                >
                  <span className="font-semibold">{followingCount}</span> following
                </button>
              </div>
              {profile.bio && <div className="text-sm mb-2">{profile.bio}</div>}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline block mb-1"
                >
                  {profile.website}
                </a>
              )}
              {profile.location && (
                <div className="text-sm text-muted-foreground">{profile.location}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-semibold">Posts</h2>
        {posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No posts yet
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
      <UserListModal
        open={followersModalOpen}
        onOpenChange={setFollowersModalOpen}
        title="Followers"
        userId={profile.id}
        type="followers"
      />
      <UserListModal
        open={followingModalOpen}
        onOpenChange={setFollowingModalOpen}
        title="Following"
        userId={profile.id}
        type="following"
      />
    </div>
  )
}

