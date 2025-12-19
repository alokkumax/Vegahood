"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const verifyToken = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setVerified(true)
        setVerifying(false)
        return
      }

      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const code = searchParams.get('code')

      if (!token_hash && !code) {
        setVerifying(false)
        toast({
          title: 'Invalid Link',
          description: 'This password reset link is invalid or has expired. Please request a new one.',
          variant: 'destructive',
        })
        return
      }

      try {
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            throw error
          }
          if (data?.session) {
            setVerified(true)
          } else {
            throw new Error('Session not established')
          }
        } else if (token_hash && type === 'recovery') {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'recovery',
          })
          if (error) {
            throw error
          }
          if (data?.session) {
            setVerified(true)
          } else {
            throw new Error('Session not established')
          }
        } else {
          throw new Error('Invalid reset link')
        }
      } catch (error: any) {
        setVerifying(false)
        toast({
          title: 'Verification Failed',
          description: error.message || 'This password reset link is invalid or has expired. Please request a new one.',
          variant: 'destructive',
        })
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [searchParams, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Session expired. Please request a new password reset link.')
      }

      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (error) {
        throw error
      }

      await supabase.auth.signOut()

      toast({
        title: 'Success',
        description: 'Password reset successfully! Redirecting to login...',
      })

      setTimeout(() => {
        window.location.replace('/login')
      }, 1500)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-14 md:pt-0">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg">Verifying reset link...</p>
              <p className="text-sm text-muted-foreground mt-2">Please wait</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-14 md:pt-0">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Invalid Link</CardTitle>
            <CardDescription className="text-center">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Link href="/forgot-password">
                <Button variant="outline" className="w-full">
                  Request New Reset Link
                </Button>
              </Link>
              <div className="mt-4">
                <Link href="/login" className="text-sm text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-14 md:pt-0">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
            <div className="text-center">
              <Link href="/login" className="text-sm text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-14 md:pt-0">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

