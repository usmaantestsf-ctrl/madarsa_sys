import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { timetable_id, date, attendance, marked_by } = body

    const supabase = await createClient()

    // Delete existing attendance for this timetable/date (to allow re-marking)
    await supabase
      .from('attendance')
      .delete()
      .eq('timetable_id', timetable_id)
      .eq('date', date)

    // Insert new attendance records
    const records = attendance.map((record: any) => ({
      timetable_id,
      student_id: record.student_id,
      date,
      status: record.status,
      marked_by,
    }))

    const { data, error } = await supabase
      .from('attendance')
      .insert(records)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
