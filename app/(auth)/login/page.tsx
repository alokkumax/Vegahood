"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email_or_username: '',
    password: '',
  })

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      toast({
        title: 'Error',
        description: decodeURIComponent(error),
        variant: 'destructive',
      })
    }
  }, [searchParams, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_or_username: formData.email_or_username,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Login API error:', {
          status: res.status,
          statusText: res.statusText,
          error: data.error,
          data: data
        })
        throw new Error(data.error || `Login failed (${res.status})`)
      }

      await new Promise(resolve => setTimeout(resolve, 100))

      toast({
        title: 'Success',
        description: 'Logged in successfully',
      })

      window.location.replace('/feed')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Login failed',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-14 md:pt-0">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">vegahood</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email_or_username">Email or Username</Label>
              <Input
                id="email_or_username"
                type="text"
                placeholder="email@example.com or username"
                value={formData.email_or_username}
                onChange={(e) => setFormData({ ...formData, email_or_username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 space-y-2">
            <div className="text-center text-sm">
              <Link href="/forgot-password" className="text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-14 md:pt-0">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
