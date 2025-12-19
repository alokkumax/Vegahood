import { redirect } from 'next/navigation'
import { getCurrentUser, getCurrentProfile } from '@/lib/auth'
import FeedContent from '@/components/FeedContent'

export default async function FeedPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const profile = await getCurrentProfile()
  
  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Setting up your profile...</p>
          <p className="text-sm text-muted-foreground mt-2">Please refresh the page in a moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 hidden sm:block">Feed</h1>
      <FeedContent />
    </div>
  )
}

