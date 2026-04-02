import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')

    const supabase = await createClient()

    let query = supabase
      .from('time_slots')
      .select('id, slot_number, start_time, end_time')
      .order('slot_number', { ascending: true })

    if (departmentId) {
      query = query.eq('department_id', departmentId)
    }

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