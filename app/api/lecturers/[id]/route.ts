import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, nic, phone, email, address, is_active } = body

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('lecturers')
      .update({ 
        name,
        nic,
        phone,
        email: email || null,
        address: address || null,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
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
    
    // Get lecturer with user_id
    const { data: lecturer, error: fetchError } = await supabase
      .from('lecturers')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !lecturer) {
      return NextResponse.json({ error: 'Lecturer not found' }, { status: 404 })
    }

    // Delete lecturer first
    const { error: lecturerError } = await supabase
      .from('lecturers')
      .delete()
      .eq('id', id)

    if (lecturerError) {
      return NextResponse.json({ error: lecturerError.message }, { status: 400 })
    }

    // Then delete user if exists
    if (lecturer.user_id) {
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', lecturer.user_id)

      if (userError) {
        console.error('Failed to delete user:', userError)
        // Lecturer is already deleted, so just log the error
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Lecturer and user deleted successfully'
    })
  } catch (error) {
    console.error('Delete lecturer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

