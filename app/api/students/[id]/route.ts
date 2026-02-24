import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      admission_number,
      name_with_initial,
      full_name,
      date_of_birth,
      nic_number,
      date_of_admission,
      father_name,
      father_status,
      department_id,
      department,
      madrasa_grade,
      usthadh_name,
      usthadh_contact_number,
      school_grade,
      district,
      address,
      contact_number,
      is_active,
      is_passed,
      qualification,      // ✅ NEW
      passed_out_date,    // ✅ NEW
    } = body

    const supabase = await createClient()

    // ─── Step 1: Update the student ───────────────────────────────
    const { data, error } = await supabase
      .from('students')
      .update({
        admission_number,
        name_with_initial,
        full_name,
        date_of_birth,
        nic_number:             nic_number || null,
        date_of_admission,
        father_name,
        father_status:          father_status || null,
        department_id:          department_id || null,
        department:             department || null,
        madrasa_grade,
        usthadh_name:           usthadh_name || null,
        usthadh_contact_number: usthadh_contact_number || null,
        school_grade:           school_grade || null,
        district:               district || null,
        address:                address || null,
        contact_number:         contact_number || null,
        is_active,
        is_passed,
        updated_at:             new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // ─── Step 2: Sync passed_students table ───────────────────────

    if (is_passed === true) {
      // Check if already exists in passed_students
      const { data: existing } = await supabase
        .from('passed_students')
        .select('id')
        .eq('student_id', id)
        .single()

      if (existing) {
        // ✅ Already exists → UPDATE qualification and date
        const { error: updateError } = await supabase
          .from('passed_students')
          .update({
            qualification:   qualification || 'Hafiz',
            passed_out_date: passed_out_date || new Date().toISOString().split('T')[0],
            department_id:   department_id || null,
            updated_at:      new Date().toISOString(),
          })
          .eq('student_id', id)

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 400 })
        }

      } else {
        // ✅ Doesn't exist → INSERT new record
        const { error: insertError } = await supabase
          .from('passed_students')
          .insert({
            student_id:      id,
            admission_number,
            full_name,
            qualification:   qualification || 'Hafiz',
            passed_out_date: passed_out_date || new Date().toISOString().split('T')[0],
            department_id:   department_id || null,
            final_class_id:  null, // will be updated after student_enrollments is set up
          })

        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 400 })
        }
      }

    } else if (is_passed === false) {
      // ✅ is_passed turned OFF → DELETE from passed_students
      const { error: deleteError } = await supabase
        .from('passed_students')
        .delete()
        .eq('student_id', id)

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 400 })
      }
    }

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from('students').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
