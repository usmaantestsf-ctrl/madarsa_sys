import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { qualifications, languages, ...lecturerData } = body
    const lecturerId = parseInt(id)

    const supabase = await createClient()

    // Update main lecturer data
    const { data: lecturer, error: lecturerError } = await supabase
      .from('lecturer')
      .update(lecturerData)
      .eq('lecturer_id', lecturerId)
      .select()
      .single()

    if (lecturerError) {
      return NextResponse.json({ error: lecturerError.message }, { status: 400 })
    }

    // Update qualifications if provided
    if (qualifications !== undefined) {
      // Delete existing qualifications
      await supabase
        .from('lecturer_qualification')
        .delete()
        .eq('lecturer_id', lecturerId)

      // Insert new qualifications
      if (qualifications.length > 0) {
        const qualificationsToInsert = qualifications.map((q: any) => ({
          lecturer_id: lecturerId,
          degree_name: q.degree_name,
          year_completed: q.year_completed || null,
          institute_name: q.institute_name || null,
        }))

        await supabase
          .from('lecturer_qualification')
          .insert(qualificationsToInsert)
      }
    }

    // Update languages if provided
    if (languages !== undefined) {
      // Delete existing languages
      await supabase
        .from('lecturer_language')
        .delete()
        .eq('lecturer_id', lecturerId)

      // Insert new languages
      if (languages.length > 0) {
        const languagesToInsert = languages.map((l: any) => ({
          lecturer_id: lecturerId,
          language_name: l.language_name,
          proficiency_level: l.proficiency_level || null,
        }))

        await supabase
          .from('lecturer_language')
          .insert(languagesToInsert)
      }
    }

    // Fetch complete updated data
    const { data: completeLecturer } = await supabase
      .from('lecturer')
      .select(`
        *,
        qualifications:lecturer_qualification(*),
        languages:lecturer_language(*)
      `)
      .eq('lecturer_id', lecturerId)
      .single()

    return NextResponse.json({
      success: true,
      data: completeLecturer,
      message: 'Lecturer updated successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
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
    const lecturerId = parseInt(id)
    const supabase = await createClient()

    // CASCADE will automatically delete related qualifications and languages
    const { error } = await supabase
      .from('lecturer')
      .delete()
      .eq('lecturer_id', lecturerId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Lecturer and related data deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete lecturer error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}