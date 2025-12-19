# Vegahood -  Application

A complete Instagram-style social media application built with Next.js, TypeScript, Supabase, Tailwind CSS, and shadcn/ui.
For Admin protected route pass = admin123

## Features

- **User Authentication**: Register, login, logout, password reset, email verification
- **User Profiles**: Customizable profiles with avatar, bio, website, location
- **Posts**: Create posts with text (max 280 chars) and images (JPEG/PNG, max 2MB)
- **Social Features**: Follow/unfollow users, like posts, comment on posts
- **Personalized Feed**: See posts from users you follow plus your own posts
- **Search**: Search for users by username or name
- **Real-time Notifications**: Get notified when someone follows, likes, or comments
- **Admin Panel**: Manage users and posts (password protected)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT-based)
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_PANEL_PASSWORD=your_admin_password
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  api/              # API route handlers
    auth/          # Authentication endpoints
    users/         # User management endpoints
    posts/         # Post endpoints
    admin/         # Admin endpoints
  (auth)/          # Auth pages (login, register)
  feed/            # Main feed page
  search/          # User search page
  profile/[username]/ # User profile pages
  admin/           # Admin panel
components/        # React components
lib/              # Utility functions
types/            # TypeScript types
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/password-reset` - Request password reset
- `POST /api/auth/password-reset-confirm` - Confirm password reset
- `POST /api/auth/change-password` - Change password (authenticated)
- `POST /api/auth/token/refresh` - Refresh session token

### Users
- `GET /api/users/{userId}` - Get user profile with counts
- `PUT /api/users/me` - Update own profile
- `GET /api/users` - List users (admin only)
- `POST /api/users/{userId}/follow` - Follow user
- `DELETE /api/users/{userId}/follow` - Unfollow user
- `GET /api/users/{userId}/followers` - Get followers list
- `GET /api/users/{userId}/following` - Get following list

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts` - Get posts (with pagination)
- `GET /api/posts/{postId}` - Get single post
- `PUT /api/posts/{postId}` - Update post (author only)
- `DELETE /api/posts/{postId}` - Delete post (author only)

### Admin
- `POST /api/admin/verify-password` - Verify admin password
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{userId}` - Get user details
- `POST /api/admin/users/{userId}/deactivate` - Deactivate user
- `GET /api/admin/posts` - List all posts
- `DELETE /api/admin/posts/{postId}` - Delete any post
- `GET /api/admin/stats` - Get statistics


## Notes

- Email verification is handled by Supabase (configure in Supabase dashboard)
- Password reset uses Supabase's built-in email flow
- Admin panel requires both `is_admin` flag in database and password verification
- Image uploads are stored in Supabase Storage



# Vegahood
