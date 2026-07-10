import { Sidebar } from '@/components/layout/sidebar-lecturer'
import { Header } from '@/components/layout/header'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function LecturerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  if (session.role !== 'lecturer') {
    redirect('/admin')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}