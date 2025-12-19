import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import AdminContent from '@/components/AdminContent'
import { createServerClient } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPage() {
  const profile = await getCurrentProfile()
  
  if (!profile) {
    redirect('/login')
  }

  const supabase = createServerClient()
  const { data: freshProfile } = await supabase
    .from('profiles')
    .select('is_admin, is_super_admin')
    .eq('id', profile.id)
    .single()

  const isAdmin = freshProfile?.is_admin === true || freshProfile?.is_super_admin === true || 
                  profile.is_admin === true || profile.is_super_admin === true

  if (!isAdmin) {
    redirect('/feed')
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Admin Panel</h1>
      <AdminContent />
    </div>
  )
}

