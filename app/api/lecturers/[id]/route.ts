import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { qualifications, languages, email, password, ...lecturerData } = body
    const lecturerId = parseInt(id)

    const supabase = await createClient()

    // ── Step 1: Update lecturer table ──
    const { data: lecturer, error: lecturerError } = await supabase
      .from('lecturer')
      .update(lecturerData)
      .eq('lecturer_id', lecturerId)
      .select()
      .single()

    if (lecturerError) {
      return NextResponse.json({ error: lecturerError.message }, { status: 400 })
    }

    // ── Step 2: Update linked users row ──
    if (lecturer.user_id) {
      const userUpdate: Record<string, any> = {
        full_name: lecturer.full_name,
        updated_at: new Date().toISOString(),
      }

      if (email?.trim()) {
        userUpdate.email = email.trim()
      }

      if (password?.trim()) {
        userUpdate.password = password.trim()
      }

      const { error: userError } = await supabase
        .from('users')
        .update(userUpdate)
        .eq('id', lecturer.user_id)

      if (userError) {
        return NextResponse.json(
          { error: `User update failed: ${userError.message}` },
          { status: 400 }
        )
      }
    } else {
      // Edge case: lecturer exists but has no user yet — create one now
      const userEmail = email?.trim()
        ? email.trim()
        : `lecturer_${lecturerId}@madrasa.lk`

      const userPassword = password?.trim() ? password.trim() : 'Lecturer@123'

      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          email: userEmail,
          password: userPassword,
          full_name: lecturer.full_name,
          role: 'lecturer',
          is_active: true,
        })
        .select()
        .single()

      if (!createUserError && newUser) {
        await supabase
          .from('lecturer')
          .update({ user_id: newUser.id })
          .eq('lecturer_id', lecturerId)
      }
    }

    // ── Step 3: Replace qualifications ──
    if (qualifications !== undefined) {
      await supabase
        .from('lecturer_qualification')
        .delete()
        .eq('lecturer_id', lecturerId)

      if (qualifications.length > 0) {
        await supabase.from('lecturer_qualification').insert(
          qualifications.map((q: any) => ({
            lecturer_id: lecturerId,
            degree_name: q.degree_name,
            year_completed: q.year_completed || null,
            institute_name: q.institute_name || null,
          }))
        )
      }
    }

    // ── Step 4: Replace languages ──
    if (languages !== undefined) {
      await supabase
        .from('lecturer_language')
        .delete()
        .eq('lecturer_id', lecturerId)

      if (languages.length > 0) {
        await supabase.from('lecturer_language').insert(
          languages.map((l: any) => ({
            lecturer_id: lecturerId,
            language_name: l.language_name,
            proficiency_level: l.proficiency_level || null,
          }))
        )
      }
    }

    // ── Step 5: Return full updated data ──
    const { data: completeLecturer } = await supabase
      .from('lecturer')
      .select(`
        *,
        qualifications:lecturer_qualification(*),
        languages:lecturer_language(*),
        user:users(id, email, is_active)
      `)
      .eq('lecturer_id', lecturerId)
      .single()

    return NextResponse.json({
      success: true,
      data: completeLecturer,
      message: 'Lecturer updated successfully',
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

    // ── Step 1: Get lecturer to find user_id ──
    const { data: lecturer, error: fetchError } = await supabase
      .from('lecturer')
      .select('user_id')
      .eq('lecturer_id', lecturerId)
      .single()

    if (fetchError) {
      console.error('[DELETE] Fetch error:', fetchError)
      return NextResponse.json(
        { error: `Could not find lecturer: ${fetchError.message}` },
        { status: 400 }
      )
    }

    // ── Step 2: Delete qualifications ──
    const { error: qualError } = await supabase
      .from('lecturer_qualification')
      .delete()
      .eq('lecturer_id', lecturerId)

    if (qualError) {
      console.error('[DELETE] Qualifications error:', qualError)
      return NextResponse.json(
        { error: `Failed to delete qualifications: ${qualError.message}` },
        { status: 400 }
      )
    }

    // ── Step 3: Delete languages ──
    const { error: langError } = await supabase
      .from('lecturer_language')
      .delete()
      .eq('lecturer_id', lecturerId)

    if (langError) {
      console.error('[DELETE] Languages error:', langError)
      return NextResponse.json(
        { error: `Failed to delete languages: ${langError.message}` },
        { status: 400 }
      )
    }

    // ── Step 4: Nullify lecturer.user_id to break FK link ──
    if (lecturer?.user_id) {
      const { error: nullifyError } = await supabase
        .from('lecturer')
        .update({ user_id: null })
        .eq('lecturer_id', lecturerId)

      if (nullifyError) {
        console.error('[DELETE] Nullify user_id error:', nullifyError)
      }
    }

    // ── Step 5: Delete user BEFORE lecturer ──
    // Must happen after nullifying user_id to avoid circular FK issues
    if (lecturer?.user_id) {
      const { error: userDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', lecturer.user_id)

      if (userDeleteError) {
        console.error('[DELETE] User delete error:', userDeleteError)
        // Log but continue — still delete the lecturer
      }
    }

    // ── Step 6: Delete lecturer row ──
    const { error: lecturerDeleteError } = await supabase
      .from('lecturer')
      .delete()
      .eq('lecturer_id', lecturerId)

    if (lecturerDeleteError) {
      console.error('[DELETE] Lecturer delete error:', lecturerDeleteError)
      return NextResponse.json(
        { error: `Failed to delete lecturer: ${lecturerDeleteError.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Lecturer and related data deleted successfully',
    })
  } catch (error: any) {
    console.error('[DELETE] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
