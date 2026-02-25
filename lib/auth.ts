// lib/auth.ts
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

export type Session = {
  userId: string
  email: string
  role: 'admin' | 'lecturer'
  fullName: string
}

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'fallback-secret-change-this-in-prod!!'
)

export async function createSession(session: Session) {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')

  if (!cookie) return null

  try {
    const { payload } = await jwtVerify(cookie.value, SECRET)
    return {
      userId:   payload.userId   as string,
      email:    payload.email    as string,
      role:     payload.role     as 'admin' | 'lecturer',
      fullName: payload.fullName as string,
    }
  } catch {
    // Expired or tampered — treat as logged out
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
