import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log('🔍 Login attempt:', { email, password })

    const supabase = await createClient()
    
    // First, check if user exists at all
    const { data: allUsers } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
    
    console.log('📋 Users found:', allUsers)

    // Now try exact match
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .eq('is_active', true)
      .single()

    console.log('✅ Match result:', { user, error })

    if (error || !user) {
      console.log('❌ Login failed:', error?.message || 'No user found')
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    })

    console.log('🎉 Login successful for:', user.email)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
      },
    })
  } catch (error) {
    console.error('💥 Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
