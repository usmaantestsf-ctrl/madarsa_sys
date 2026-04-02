import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, is_active, time_slots } = body

    const supabase = await createClient()

    // Update department
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

    // Handle time slots
    if (time_slots) {
      const existing = time_slots.filter((s: any) => s.id)
      const added = time_slots.filter((s: any) => !s.id)
      const existingIds = existing.map((s: any) => s.id)

      // Delete removed slots
      await supabase
        .from('time_slots')
        .delete()
        .eq('department_id', id)
        .not('id', 'in', `(${existingIds.join(',')})`)

      // Update existing slots
      for (const slot of existing) {
        await supabase
          .from('time_slots')
          .update({
            slot_number: slot.slot_number,
            start_time: slot.start_time,
            end_time: slot.end_time,
          })
          .eq('id', slot.id)
      }

      // Insert new slots
      if (added.length > 0) {
        await supabase.from('time_slots').insert(
          added.map((s: any) => ({
            slot_number: s.slot_number,
            start_time: s.start_time,
            end_time: s.end_time,
            department_id: id,
          }))
        )
      }
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