// app/api/students/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ── GET — fetch students or passed students ───────────────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view')
    const supabase = await createClient()

    // ── Passed students view ─────────────────────────────────────────────────
    if (view === 'passed') {
      const { data, error } = await supabase
        .from('passed_students')
        .select(`
          *,
          departments ( name ),
          classes ( name )
        `)
        .order('passed_out_date', { ascending: false })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    // ── Default: active students ─────────────────────────────────────────────
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        departments ( name ),
        student_enrollments (
          id,
          academic_year,
          is_current,
          status,
          classes ( id, name )
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST — create new student ─────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
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
      class_id,        // NEW
      academic_year,   // NEW
    } = body

    const supabase = await createClient()

    // Step 1: Insert student
    const { data, error } = await supabase
      .from('students')
      .insert({
        admission_number,
        name_with_initial,
        full_name,
        date_of_birth,
        nic_number:               nic_number               ?? null,
        date_of_admission:        date_of_admission        ?? new Date().toISOString().split('T')[0],
        father_name,
        father_status:            father_status            ?? null,
        department_id:            department_id            ?? null,
        department:               department               ?? null,
        madrasa_grade,
        usthadh_name:             usthadh_name             ?? null,
        usthadh_contact_number:   usthadh_contact_number   ?? null,
        school_grade:             school_grade             ?? null,
        district:                 district                 ?? null,
        address:                  address                  ?? null,
        contact_number:           contact_number           ?? null,
        is_active:                true,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Step 2: Create enrollment if class_id provided
    if (class_id && academic_year) {
      const { error: enrollError } = await supabase
        .from('student_enrollments')
        .insert({
          student_id:   data.id,
          class_id,
          department_id: department_id ?? null,
          academic_year,
          is_current:   true,
          status:       'active',
          enrolled_at:  date_of_admission ?? new Date().toISOString().split('T')[0],
        })

      if (enrollError) {
        // Student created but enrollment failed — still return student but warn
        return NextResponse.json(
          { ...data, warning: `Student created but enrollment failed: ${enrollError.message}` },
          { status: 201 }
        )
      }
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
