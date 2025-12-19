import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import SearchContent from '@/components/SearchContent'

export default async function SearchPage() {
  const profile = await getCurrentProfile()
  
  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Search Users</h1>
      <SearchContent />
    </div>
  )
}

