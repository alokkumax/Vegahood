"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm?type=recovery`,
      })

      if (error) {
        throw new Error(error.message)
      }

      setSent(true)
      toast({
        title: 'Success',
        description: 'Password reset email sent! Check your inbox.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send password reset email',
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
          <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            {sent
              ? 'Check your email for a password reset link'
              : 'Enter your email address and we\'ll send you a link to reset your password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </div>
              <Button
                onClick={() => {
                  setSent(false)
                  setEmail('')
                }}
                variant="outline"
                className="w-full"
              >
                Send Another Email
              </Button>
              <div className="text-center">
                <Link href="/login" className="text-sm text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <div className="text-center">
                <Link href="/login" className="text-sm text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

