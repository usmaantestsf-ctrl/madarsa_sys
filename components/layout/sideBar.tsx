'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Users, 
  UserCircle, 
  Calendar, 
  ClipboardCheck,
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
  { href: '/dashboard', label: "Today's Timetable", icon: MonitorPlay },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-bold text-primary-600">Madrasa System</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
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

      {/* Footer - Optional branding */}
      <div className="border-t border-gray-200 p-4">
        <p className="text-xs text-gray-500 text-center">
          Madrasa Management System
        </p>
      </div>
    </div>
  )
}
