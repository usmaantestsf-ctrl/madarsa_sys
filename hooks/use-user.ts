'use client'

import { useEffect, useState } from 'react'

export type UserSession = {
  userId: string
  email: string
  role: 'admin' | 'lecturer'
  fullName: string
}

export function useUser() {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user || null)
        setLoading(false)
      })
      .catch(() => {
        setUser(null)
        setLoading(false)
      })
  }, [])

  return { user, loading }
}
