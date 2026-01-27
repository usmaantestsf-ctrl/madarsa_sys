// app/api/timetable/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { class_id, subject_id, lecturer_id, day_of_week, start_time, end_time } = body

    if (!class_id || !subject_id || !lecturer_id) {
      return NextResponse.json(
        { error: 'class_id, subject_id and lecturer_id are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('timetable')
      .insert({
        class_id,
        subject_id,
        lecturer_id,
        day_of_week,
        start_time,
        end_time,
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

// Optional: keep existing PUT and DELETE if needed
export async function PUT(request: Request) {
  return NextResponse.json({ error: 'PUT not implemented' }, { status: 405 })
}

export async function DELETE(request: Request) {
  return NextResponse.json({ error: 'DELETE not implemented' }, { status: 405 })
}
