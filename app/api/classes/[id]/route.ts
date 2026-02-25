import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, department_id, default_strength, is_active } = body

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('classes')
      .update({
        name,
        department_id,
        default_strength,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // ✅ Check if any students are enrolled in this class
    const { count } = await supabase
      .from('student_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', id)
      .eq('is_current', true)

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Cannot delete — ${count} student(s) currently enrolled in this class.` },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
