// app/api/students/enrollment/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')  // called as /api/students/enrollment?id=xxx

    if (!id) {
      return NextResponse.json(null)
    }

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
