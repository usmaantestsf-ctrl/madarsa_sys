// app/api/students/[id]/enrollment/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('student_enrollments')
      .select('id, class_id, academic_year, status')
      .eq('student_id', id)
      .eq('is_current', true)
      .single()

    if (error) {
      return NextResponse.json(null)
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(null)
  }
}
