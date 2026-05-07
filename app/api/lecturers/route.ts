// app/api/lecturers/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const buildEmailBase = (name: string): string =>
  name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { qualifications, languages, email, password, ...lecturerData } = body

    const supabase = await createClient()

    // ── Step 1: Insert lecturer ──
    const { data: lecturer, error: lecturerError } = await supabase
      .from('lecturer')
      .insert({
        admission_no:        lecturerData.admission_no        || null,
        admission_date:      lecturerData.admission_date      || null,
        full_name:           lecturerData.full_name,
        visual_name:         lecturerData.visual_name         || null,  // ← NEW
        name_with_initial:   lecturerData.name_with_initial   || null,
        date_of_birth:       lecturerData.date_of_birth       || null,
        nic_no:              lecturerData.nic_no              || null,
        address:             lecturerData.address             || null,
        district:            lecturerData.district            || null,
        city:                lecturerData.city                || null,
        mobile:              lecturerData.mobile              || null,
        whatsapp:            lecturerData.whatsapp            || null,
        date_of_appointment: lecturerData.date_of_appointment || null,
        age_at_appointment:  lecturerData.age_at_appointment  || null,
        appointment_post:    lecturerData.appointment_post    || null,
        madrasa_name:        lecturerData.madrasa_name        || null,
        madrasa_address:     lecturerData.madrasa_address     || null,
        passed_out_year:     lecturerData.passed_out_year     || null,
        certificate_no:      lecturerData.certificate_no      || null,
        other_skills:        lecturerData.other_skills        || null,
        remarks:             lecturerData.remarks             || null,
        signature_name:      lecturerData.signature_name      || null,
      })
      .select()
      .single()

    if (lecturerError) {
      return NextResponse.json({ error: lecturerError.message }, { status: 400 })
    }

    // ── Step 2: Build credentials using visual_name (with _) + 4 random digits ──
    const fourDigits = Math.floor(1000 + Math.random() * 9000).toString()
    const nameBase = lecturerData.visual_name?.trim()
      ? buildEmailBase(lecturerData.visual_name)
      : buildEmailBase(lecturerData.full_name)

    const userEmail    = email?.trim() || `${nameBase}${fourDigits}@madrasa.lk`
    const userPassword = password?.trim() || 'Lecturer@123'

    // ── Step 3: Create user row ──
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email:     userEmail,
        password:  userPassword,
        full_name: lecturer.full_name,
        role:      'lecturer',
        is_active: true,
      })
      .select()
      .single()

    if (userError) {
      // Rollback: remove the lecturer we just created
      await supabase
        .from('lecturer')
        .delete()
        .eq('lecturer_id', lecturer.lecturer_id)

      return NextResponse.json(
        { error: `User creation failed: ${userError.message}` },
        { status: 400 }
      )
    }

    // ── Step 4: Link user_id back to lecturer ──
    await supabase
      .from('lecturer')
      .update({ user_id: user.id })
      .eq('lecturer_id', lecturer.lecturer_id)

    // ── Step 5: Insert qualifications ──
    if (qualifications?.length > 0) {
      const { error: qualError } = await supabase
        .from('lecturer_qualification')
        .insert(
          qualifications.map((q: any) => ({
            lecturer_id:    lecturer.lecturer_id,
            degree_name:    q.degree_name,
            year_completed: q.year_completed || null,
            institute_name: q.institute_name || null,
          }))
        )
      if (qualError) console.error('Failed to insert qualifications:', qualError)
    }

    // ── Step 6: Insert languages ──
    if (languages?.length > 0) {
      const { error: langError } = await supabase
        .from('lecturer_language')
        .insert(
          languages.map((l: any) => ({
            lecturer_id:       lecturer.lecturer_id,
            language_name:     l.language_name,
            proficiency_level: l.proficiency_level || null,
          }))
        )
      if (langError) console.error('Failed to insert languages:', langError)
    }

    // ── Step 7: Return complete data ──
    const { data: completeLecturer } = await supabase
      .from('lecturer')
      .select(`
        *,
        qualifications:lecturer_qualification(*),
        languages:lecturer_language(*),
        user:users(id, email, is_active)
      `)
      .eq('lecturer_id', lecturer.lecturer_id)
      .single()

    return NextResponse.json({
      success:          true,
      data:             completeLecturer,
      lecturer_id:      lecturer.lecturer_id,
      visual_name_slug: nameBase,   // ← returned so dialog uses for file upload folder
      credentials: {
        email:    userEmail,
        password: userPassword,
      },
      message: 'Lecturer created successfully',
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
        languages:lecturer_language(*),
        user:users(id, email, is_active)
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