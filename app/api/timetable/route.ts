import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { class_id, subject_id, lecturer_id, day_of_week, time_slot_id } = body

    // Remove lecturer_id from required fields check
    if (!class_id || !subject_id || !time_slot_id) {
      return NextResponse.json(
        { error: 'class_id, subject_id, and time_slot_id are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('timetable')
      .insert({
        class_id,
        subject_id,
        lecturer_id: lecturer_id || null, // Allow null if not provided
        day_of_week,
        time_slot_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('POST /api/timetable error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}