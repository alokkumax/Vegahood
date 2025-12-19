"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, User, LogOut, Menu, X, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/hooks/use-toast'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData)

        const { data: notifications } = await supabase
          .from('notifications')
          .select('id')
          .eq('receiver_id', user.id)
          .eq('is_read', false)
        setNotificationCount(notifications?.length || 0)

        const channel = supabase
          .channel('notifications')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `receiver_id=eq.${user.id}`,
          }, (payload) => {
            setNotificationCount((prev) => prev + 1)
          })
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        getUser()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setProfile(null)
    router.push('/login')
    router.refresh()
  }

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return (
      <nav className="fixed top-0 left-0 right-0 border-b bg-background flex items-center justify-between px-4 h-14 z-50">
        <Link href="/" className="text-xl font-bold">
          Vegahood
        </Link>
        {!user ? (
          <div className="flex items-center gap-2">
            {pathname.startsWith('/login') ? (
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
            )}
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </nav>
    )
  }

  if (!user) {
    return null
  }

  const navItems: Array<{
    href: string
    icon: any
    label: string
    useAvatar?: boolean
  }> = [
    { href: '/feed', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: `/profile/${profile?.username}`, icon: User, label: 'Profile', useAvatar: true },
  ]

  if (profile?.is_admin || profile?.is_super_admin) {
    navItems.push({ href: '/admin', icon: Shield, label: 'Admin' })
  }

  const isActive = (href: string) => pathname === href || (href === '/feed' && pathname === '/')

  return (
    <>
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 border-r bg-background flex-col p-4 justify-between">
        <div className="space-y-4">
          <div className="text-2xl font-bold mb-6">Vegahood</div>
          {navItems.map((item) => {
            const Icon = item.icon
            const useAvatar = item.useAvatar && profile
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                {useAvatar ? (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                    <AvatarFallback className="text-xs">
                      {profile.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                <span>{item.label}</span>
                {item.href === '/feed' && notificationCount > 0 && (
                  <Badge className="ml-auto">{notificationCount}</Badge>
                )}
              </Link>
            )
          })}
        </div>
        <div className="pt-4 border-t">
          <div className="flex items-center space-x-3 p-3 mb-4">
            <Avatar>
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username} />
              <AvatarFallback>{profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{profile?.username}</div>
              <div className="text-xs text-muted-foreground truncate">{profile?.full_name}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      <nav className="md:hidden fixed top-0 left-0 right-0 border-b bg-background flex items-center justify-between px-4 h-14 z-50">
        <Link href="/feed" className="text-xl font-bold">
          Vegahood
        </Link>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex justify-around items-center h-16 z-50">
        {navItems.map((item) => {
          const Icon = item.icon
          const useAvatar = item.useAvatar && profile
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                {useAvatar ? (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                    <AvatarFallback className="text-xs">
                      {profile.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <>
                    <Icon className="h-5 w-5" />
                    {item.href === '/feed' && notificationCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs">
                        {notificationCount}
                      </Badge>
                    )}
                  </>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

