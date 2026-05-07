import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const classId = searchParams.get('classId')
    const dayOfWeek = searchParams.get('dayOfWeek')

    const supabase = await createClient()

    let query = supabase
      .from('time_slots')
      .select('id, slot_number, start_time, end_time')
      .order('slot_number', { ascending: true })

    if (departmentId) query = query.eq('department_id', departmentId)
    if (classId) query = query.eq('class_id', classId)
    if (dayOfWeek !== null) query = query.eq('day_of_week', parseInt(dayOfWeek))

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/time-slots error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { department_id, class_id, day_of_week, slot_number, start_time, end_time } = body

    if (!department_id || !class_id || day_of_week === undefined || !slot_number || !start_time || !end_time) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('time_slots')
      .insert({ department_id, class_id, day_of_week, slot_number, start_time, end_time })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('POST /api/time-slots error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const supabase = await createClient()

    const { error } = await supabase.from('time_slots').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/time-slots error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}