import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, is_active } = body

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('departments')
      .update({ 
        name, 
        type, 
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

// export async function DELETE(
//   request: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params
//     const supabase = await createClient()
    
//     const { error } = await supabase
//       .from('departments')
//       .delete()
//       .eq('id', id)

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 400 })
//     }

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }

// api/departments/[id]/route.ts — update DELETE
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // ✅ Check if department has classes
    const { count } = await supabase
      .from('classes')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', id)

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Cannot delete — this department has ${count} class(es). Delete classes first.` },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)

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

