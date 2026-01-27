import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, department_id, default_strength } = body

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('classes')
      .insert({ 
        name, 
        department_id, 
        default_strength,
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
