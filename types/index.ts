export interface Profile {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  website: string | null
  location: string | null
  is_admin?: boolean
  is_super_admin?: boolean
  profile_visibility: 'public' | 'private' | 'followers_only'
  created_at: string
}

export interface Post {
  id: string
  author_id: string
  content: string
  image_url: string | null
  category: 'general' | 'announcement' | 'question'
  is_active: boolean
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
}

export interface Notification {
  id: string
  receiver_id: string
  sender_id: string
  type: 'like' | 'comment' | 'follow'
  post_id: string | null
  is_read: boolean
  created_at: string
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface Like {
  user_id: string
  post_id: string
  created_at: string
}

export interface UserWithCounts extends Profile {
  follower_count: number
  following_count: number
  posts_count: number
}

