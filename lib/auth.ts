import { cookies } from 'next/headers'

export type Session = {
  userId: string
  email: string
  role: 'admin' | 'lecturer'
  fullName: string
}

export async function createSession(session: Session) {
  const cookieStore = await cookies()
  cookieStore.set('session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  
  if (!session) return null
  
  try {
    return JSON.parse(session.value)
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
