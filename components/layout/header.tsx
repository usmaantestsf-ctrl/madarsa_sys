'use client'

import { useUser } from '@/hooks/use-user'

export function Header() {
  const { user } = useUser()

  return (
    <header className="h-16 border-b border-gray-200 bg-white">
      <div className="flex h-full items-center justify-between px-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back, {user?.fullName || 'Admin'}
          </h2>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-700">
              {user?.fullName?.charAt(0) || 'A'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
