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
      qualification,
      passed_out_date,
      class_id,        // ✅ NEW
      academic_year,   // ✅ NEW
    } = body

    const supabase = await createClient()

    // ─── Step 1: Update student ────────────────────────────────────
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

    // ─── Step 2: Sync enrollment if class_id provided ─────────────
    if (class_id && academic_year) {
      // Check if enrollment exists for this year
      const { data: existingEnrollment } = await supabase
        .from('student_enrollments')
        .select('id')
        .eq('student_id', id)
        .eq('academic_year', academic_year)
        .single()

      if (existingEnrollment) {
        // ✅ Already enrolled this year → UPDATE class
        await supabase
          .from('student_enrollments')
          .update({
            class_id,
            department_id: department_id || null,
            is_current:    true,
            updated_at:    new Date().toISOString(),
          })
          .eq('id', existingEnrollment.id)
      } else {
        // ✅ No enrollment this year → mark old ones not current + INSERT new
        await supabase
          .from('student_enrollments')
          .update({ is_current: false })
          .eq('student_id', id)
          .eq('is_current', true)

        await supabase
          .from('student_enrollments')
          .insert({
            student_id:    id,
            class_id,
            department_id: department_id || null,
            academic_year,
            is_current:    true,
            status:        'active',
            enrolled_at:   new Date().toISOString().split('T')[0],
          })
      }
    }

    // ─── Step 3: Sync passed_students table ───────────────────────
    if (is_passed === true) {
      const { data: existing } = await supabase
        .from('passed_students')
        .select('id')
        .eq('student_id', id)
        .single()

      // Get final class from current enrollment
      const { data: currentEnrollment } = await supabase
        .from('student_enrollments')
        .select('class_id')
        .eq('student_id', id)
        .eq('is_current', true)
        .single()

      if (existing) {
        await supabase
          .from('passed_students')
          .update({
            qualification:   qualification || 'Hafiz',
            passed_out_date: passed_out_date || new Date().toISOString().split('T')[0],
            department_id:   department_id || null,
            final_class_id:  currentEnrollment?.class_id || null, // ✅ now populated
            updated_at:      new Date().toISOString(),
          })
          .eq('student_id', id)
      } else {
        await supabase
          .from('passed_students')
          .insert({
            student_id:      id,
            admission_number,
            full_name,
            qualification:   qualification || 'Hafiz',
            passed_out_date: passed_out_date || new Date().toISOString().split('T')[0],
            department_id:   department_id || null,
            final_class_id:  currentEnrollment?.class_id || null, // ✅ now populated
          })
      }

      // ✅ Also mark enrollment as passed
      await supabase
        .from('student_enrollments')
        .update({ status: 'passed', is_current: false })
        .eq('student_id', id)
        .eq('is_current', true)

    } else if (is_passed === false) {
      await supabase
        .from('passed_students')
        .delete()
        .eq('student_id', id)
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
