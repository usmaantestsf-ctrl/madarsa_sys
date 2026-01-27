import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, nic, phone, email, address } = body

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('lecturers')
      .insert({ 
        name, 
        nic, 
        phone, 
        email: email || null, 
        address: address || null,
        is_active: true 
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
