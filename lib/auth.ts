import { createServerClient } from './supabaseClient'
import { cookies } from 'next/headers'

export async function getServerSession() {
  const supabase = createServerClient()
  const cookieStore = await cookies()
  
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getCurrentUser() {
  const session = await getServerSession()
  if (!session) return null

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function getCurrentProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !data) return null
  return data
}

export async function requireAdmin() {
  const profile = await getCurrentProfile()
  const isAdmin = profile?.is_admin === true || profile?.is_super_admin === true
  if (!profile || !isAdmin) {
    throw new Error('Admin access required')
  }
  return profile
}

