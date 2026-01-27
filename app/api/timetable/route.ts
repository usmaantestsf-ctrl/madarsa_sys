import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { day_of_week, class_id, subject_id, lecturer_id, time_slot_id } = body

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('timetable')
      .insert({ 
        day_of_week,
        class_id,
        subject_id,
        lecturer_id,
        time_slot_id,
        valid_from: new Date().toISOString().split('T')[0],
        valid_to: null,
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
