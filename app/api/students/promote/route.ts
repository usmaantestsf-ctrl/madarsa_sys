import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { academic_year, new_academic_year } = body

    if (!academic_year || !new_academic_year) {
      return NextResponse.json(
        { error: 'Both current and new academic year are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // ─── Step 1: Get all active current enrollments ────────────────
    const { data: enrollments, error: fetchError } = await supabase
      .from('student_enrollments')
      .select(`
        id,
        student_id,
        class_id,
        department_id,
        academic_year,
        students (
          id,
          is_passed,
          is_active,
          admission_number,
          full_name
        )
      `)
      .eq('academic_year', academic_year)
      .eq('is_current', true)
      .eq('status', 'active')

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 })
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json(
        { error: `No active enrollments found for academic year ${academic_year}` },
        { status: 404 }
      )
    }

    // ─── Step 2: Get full progression map separately ───────────────
    const { data: progressionMap, error: progressionError } = await supabase
      .from('class_progression_map')
      .select('current_class_id, next_class_id')

    if (progressionError) {
      return NextResponse.json({ error: progressionError.message }, { status: 400 })
    }

    // Build a lookup map: current_class_id → next_class_id
    const progressionLookup: Record<string, string | null> = {}
    progressionMap?.forEach(p => {
      progressionLookup[p.current_class_id] = p.next_class_id
    })

    let promoted = 0
    let passedOut = 0
    let skipped = 0
    const errors: string[] = []

    for (const enrollment of enrollments) {
      const student = enrollment.students as any

      // ─── Skip already passed out students ─────────────────────
      if (student?.is_passed === true) {
        skipped++
        continue
      }

      // ─── Skip inactive students ────────────────────────────────
      if (student?.is_active === false) {
        skipped++
        continue
      }

      // ─── Lookup next class from progression map ────────────────
      const nextClassId = enrollment.class_id in progressionLookup
        ? progressionLookup[enrollment.class_id]
        : undefined

      // ─── Class not in progression map — skip with warning ──────
      if (nextClassId === undefined) {
        errors.push(`${student?.full_name}: Class not found in progression map — skipped`)
        skipped++
        continue
      }

      // ─── Mark current enrollment as promoted ───────────────────
      const { error: updateError } = await supabase
        .from('student_enrollments')
        .update({
          is_current:  false,
          status:      'promoted',
          promoted_at: new Date().toISOString().split('T')[0],
          updated_at:  new Date().toISOString(),
        })
        .eq('id', enrollment.id)

      if (updateError) {
        errors.push(`Failed to update enrollment for ${student?.full_name}: ${updateError.message}`)
        continue
      }

      if (nextClassId === null) {
        // ─── FINAL GRADE → Auto mark as passed out ────────────────
        await supabase
          .from('students')
          .update({
            is_passed:  true,
            is_active:  false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', enrollment.student_id)

        await supabase
          .from('passed_students')
          .insert({
            student_id:       enrollment.student_id,
            admission_number: student?.admission_number,
            full_name:        student?.full_name,
            qualification:    'Hafiz',
            passed_out_date:  new Date().toISOString().split('T')[0],
            department_id:    enrollment.department_id,
            final_class_id:   enrollment.class_id,
          })

        passedOut++

      } else {
        // ─── Normal promotion → Insert new enrollment ──────────────
        const { error: insertError } = await supabase
          .from('student_enrollments')
          .insert({
            student_id:    enrollment.student_id,
            class_id:      nextClassId,
            department_id: enrollment.department_id,
            academic_year: new_academic_year,
            is_current:    true,
            status:        'active',
            enrolled_at:   new Date().toISOString().split('T')[0],
          })

        if (insertError) {
          errors.push(`Failed to enroll ${student?.full_name}: ${insertError.message}`)
          continue
        }

        promoted++
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total:     enrollments.length,
        promoted,
        passedOut,
        skipped,
        errors:    errors.length,
      },
      errors,
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
