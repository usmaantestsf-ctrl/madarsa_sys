import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { newAcademicYear } = await request.json()

    if (!newAcademicYear) {
      return NextResponse.json(
        { error: 'newAcademicYear is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // ── 1. Fetch progression maps for ALL departments ──
    const { data: progressionMaps, error: progError } = await supabase
      .from('class_progression_map')
      .select('department_id, current_class_id, next_class_id')

    if (progError) {
      return NextResponse.json({ error: progError.message }, { status: 400 })
    }

    if (!progressionMaps || progressionMaps.length === 0) {
      return NextResponse.json(
        { error: 'No class progression maps found. Please configure progression maps first.' },
        { status: 400 }
      )
    }

    // Build lookup: "dept_id__class_id" → next_class_id (null = final class)
    const progressionLookup: Record<string, string | null> = {}
    const departmentsWithProgression = new Set<string>()

    progressionMaps.forEach(p => {
      progressionLookup[`${p.department_id}__${p.current_class_id}`] = p.next_class_id
      departmentsWithProgression.add(p.department_id)
    })

    // ── 2. Fetch all active enrollments ──
    const { data: enrollments, error: enrollError } = await supabase
      .from('student_enrollments')
      .select(`
        id,
        student_id,
        class_id,
        department_id,
        academic_year,
        students (
          id,
          admission_number,
          full_name
        )
      `)
      .eq('is_current', true)
      .eq('status', 'active')

    if (enrollError) {
      return NextResponse.json({ error: enrollError.message }, { status: 400 })
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        result: { total: 0, promoted: 0, passedOut: 0, skipped: 0, failed: 0, errors: [] }
      })
    }

    const today    = new Date().toISOString().split('T')[0]
    let promoted   = 0
    let passedOut  = 0
    let skipped    = 0
    let failed     = 0
    const errors: string[] = []

    for (const enrollment of enrollments) {
      const student = enrollment.students as any

      // ── Skip: department has no progression map at all ──
      if (!departmentsWithProgression.has(enrollment.department_id)) {
        skipped++
        continue
      }

      try {
        const key         = `${enrollment.department_id}__${enrollment.class_id}`
        const hasMapping  = Object.prototype.hasOwnProperty.call(progressionLookup, key)
        const nextClassId = hasMapping ? progressionLookup[key] : undefined

        // ── Skip: this specific class has no mapping in the progression map ──
        if (nextClassId === undefined) {
          skipped++
          continue
        }

        // ── Close current enrollment ──
        const { error: closeError } = await supabase
          .from('student_enrollments')
          .update({
            is_current:  false,
            status:      nextClassId ? 'promoted' : 'passed',
            promoted_at: today,
          })
          .eq('id', enrollment.id)

        if (closeError) throw new Error(`Failed to close enrollment: ${closeError.message}`)

        if (nextClassId) {
          // ── PROMOTE: create new enrollment in next class ──
          const { error: newEnrollError } = await supabase
            .from('student_enrollments')
            .insert({
              student_id:    enrollment.student_id,
              class_id:      nextClassId,
              department_id: enrollment.department_id,
              academic_year: newAcademicYear,
              is_current:    true,
              status:        'active',
              enrolled_at:   today,
            })

          if (newEnrollError) throw new Error(`Failed to create enrollment: ${newEnrollError.message}`)
          promoted++

        } else {
          // ── PASSED OUT: final class (next_class_id is null) ──

          // Avoid duplicate in passed_students
          const { data: existing } = await supabase
            .from('passed_students')
            .select('id')
            .eq('student_id', enrollment.student_id)
            .maybeSingle()

          if (!existing) {
            const { error: passedError } = await supabase
              .from('passed_students')
              .insert({
                student_id:       enrollment.student_id,
                admission_number: student?.admission_number || '',
                full_name:        student?.full_name        || '',
                qualification:    'Completed',
                passed_out_date:  today,
                department_id:    enrollment.department_id,
                final_class_id:   enrollment.class_id,
              })

            if (passedError) throw new Error(`Failed to insert passed student: ${passedError.message}`)
          }

          // Mark student is_passed = true, is_active = false
          const { error: studentUpdateError } = await supabase
            .from('students')
            .update({ is_active: false, is_passed: true })
            .eq('id', enrollment.student_id)

          if (studentUpdateError) throw new Error(`Failed to update student: ${studentUpdateError.message}`)

          passedOut++
        }

      } catch (err: any) {
        failed++
        errors.push(`${student?.full_name || enrollment.student_id}: ${err.message}`)
      }
    }

    return NextResponse.json({
      result: {
        total:    enrollments.length,
        promoted,
        passedOut,
        skipped,
        failed,
        errors,
      }
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
