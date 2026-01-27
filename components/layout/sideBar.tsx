'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Users, 
  UserCircle, 
  Calendar, 
  ClipboardCheck,
  LogOut ,
  MonitorPlay
} from 'lucide-react'
import { cn } from '@/lib/utils'

const adminMenuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/classes', label: 'Classes', icon: GraduationCap },
  { href: '/admin/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/admin/lecturers', label: 'Lecturers', icon: UserCircle },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/timetable', label: 'Timetable', icon: Calendar },
  { href: '/admin/attendance', label: 'Attendance', icon: ClipboardCheck },
  { href: '/dashboard', label: 'Today\'s Timetable', icon: MonitorPlay },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-bold text-primary-600">Madrasa System</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {adminMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
