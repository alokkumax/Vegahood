import Navbar from '@/components/Navbar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="md:ml-64 pt-14 md:pt-0 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  )
}

