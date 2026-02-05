// app/api/lecturers/list/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: lecturers, error } = await supabase
      .from('lecturer')
      .select('lecturer_id, full_name')
      .order('full_name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Transform to expected format for the dropdown
    const transformed = lecturers.map(lecturer => ({
      id: lecturer.lecturer_id,
      name: lecturer.full_name
    }))

    return NextResponse.json(transformed)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}