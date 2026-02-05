// app/api/lecturers/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { qualifications, languages, ...lecturerData } = body

    const supabase = await createClient()

    // Step 1: Create lecturer
    const { data: lecturer, error: lecturerError } = await supabase
      .from('lecturer')
      .insert({
        admission_no: lecturerData.admission_no || null,
        admission_date: lecturerData.admission_date || null,
        full_name: lecturerData.full_name,
        name_with_initial: lecturerData.name_with_initial || null,
        date_of_birth: lecturerData.date_of_birth || null,
        nic_no: lecturerData.nic_no || null,
        address: lecturerData.address || null,
        district: lecturerData.district || null,
        city: lecturerData.city || null,
        mobile: lecturerData.mobile || null,
        whatsapp: lecturerData.whatsapp || null,
        date_of_appointment: lecturerData.date_of_appointment || null,
        age_at_appointment: lecturerData.age_at_appointment || null,
        appointment_post: lecturerData.appointment_post || null,
        madrasa_name: lecturerData.madrasa_name || null,
        madrasa_address: lecturerData.madrasa_address || null,
        passed_out_year: lecturerData.passed_out_year || null,
        certificate_no: lecturerData.certificate_no || null,
        other_skills: lecturerData.other_skills || null,
        remarks: lecturerData.remarks || null,
        signature_name: lecturerData.signature_name || null,
      })
      .select()
      .single()

    if (lecturerError) {
      return NextResponse.json({ error: lecturerError.message }, { status: 400 })
    }

    // Step 2: Create qualifications if provided
    if (qualifications && qualifications.length > 0) {
      const qualificationsToInsert = qualifications.map((q: any) => ({
        lecturer_id: lecturer.lecturer_id,
        degree_name: q.degree_name,
        year_completed: q.year_completed || null,
        institute_name: q.institute_name || null,
      }))

      const { error: qualError } = await supabase
        .from('lecturer_qualification')
        .insert(qualificationsToInsert)

      if (qualError) {
        console.error('Failed to insert qualifications:', qualError)
      }
    }

    // Step 3: Create languages if provided
    if (languages && languages.length > 0) {
      const languagesToInsert = languages.map((l: any) => ({
        lecturer_id: lecturer.lecturer_id,
        language_name: l.language_name,
        proficiency_level: l.proficiency_level || null,
      }))

      const { error: langError } = await supabase
        .from('lecturer_language')
        .insert(languagesToInsert)

      if (langError) {
        console.error('Failed to insert languages:', langError)
      }
    }

    // Fetch complete lecturer data with relations
    const { data: completeLecturer } = await supabase
      .from('lecturer')
      .select(`
        *,
        qualifications:lecturer_qualification(*),
        languages:lecturer_language(*)
      `)
      .eq('lecturer_id', lecturer.lecturer_id)
      .single()

    return NextResponse.json({
      success: true,
      data: completeLecturer,
      message: 'Lecturer created successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: lecturers, error } = await supabase
      .from('lecturer')
      .select(`
        *,
        qualifications:lecturer_qualification(*),
        languages:lecturer_language(*)
      `)
      .order('record_created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: lecturers })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}