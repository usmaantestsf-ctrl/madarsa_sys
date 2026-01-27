import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('time_slots')
      .select('id, slot_number, start_time, end_time')
      .order('slot_number', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/time-slots error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
