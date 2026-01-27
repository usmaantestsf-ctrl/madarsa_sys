'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardCheck,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const lecturerMenuItems = [
  { href: '/lecturer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lecturer/timetable', label: 'My Timetable', icon: Calendar },
  { href: '/lecturer/attendance', label: 'Mark Attendance', icon: ClipboardCheck },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-gray-200 shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <aside
        className={cn(
          // Base styles
          'h-screen w-64 flex flex-col bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out',
          // Mobile: fixed and translateX
          'fixed top-0 left-0 z-50',
          // Desktop: remove fixed, add relative
          'lg:relative lg:z-auto',
          // Mobile transform
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop always visible
          'lg:translate-x-0'
        )}
      >
        {/* Logo & Close Button */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <h1 className="text-xl font-bold text-primary-600">Madrasa System</h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {lecturerMenuItems.map((item) => {
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

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <p className="text-xs text-gray-500 text-center">
            Lecturer Portal
          </p>
        </div>
      </aside>
    </>
  )
}
