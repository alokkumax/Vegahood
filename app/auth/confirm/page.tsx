"use client"

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleConfirmation = async () => {
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const code = searchParams.get('code')

      if (code) {
        const type = searchParams.get('type')
        
        if (type === 'recovery') {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (!error) {
            await new Promise(resolve => setTimeout(resolve, 500))
            window.location.replace(`/reset-password?code=${code}&type=recovery`)
            return
          } else {
            window.location.replace('/login?error=' + encodeURIComponent('Password reset verification failed'))
            return
          }
        } else {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (!error) {
            await new Promise(resolve => setTimeout(resolve, 500))
            router.push('/feed')
            router.refresh()
            window.location.reload()
            return
          }
        }
      }

      if (token_hash && type) {
        if (type === 'recovery') {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'recovery',
          })
          
          await new Promise(resolve => setTimeout(resolve, 500))
          
          window.location.replace(`/reset-password?token_hash=${token_hash}&type=${type}`)
          return
        }

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type === 'signup' ? 'signup' : type === 'email_change' ? 'email_change' : 'email',
        })

      if (!error && data?.session) {
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push('/feed')
        router.refresh()
        window.location.reload()
        return
      }
      }

      router.push('/login?error=Verification failed')
    }

    handleConfirmation()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Verifying your email...</p>
        <p className="text-sm text-muted-foreground mt-2">Please wait</p>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}

