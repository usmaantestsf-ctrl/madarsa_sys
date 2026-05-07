import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('department_id')  // ✅ NEW
    const activeOnly = searchParams.get('active') === 'true' // ✅ NEW

    let query = supabase
      .from('classes')
      .select('id, name, department_id, default_strength, is_active')
      .order('name')

    if (departmentId) {
      query = query.eq('department_id', departmentId) // ✅ filter by dept
    }

    if (activeOnly) {
      query = query.eq('is_active', true)             // ✅ active only
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Only the POST handler changes — GET is untouched
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, department_id, default_strength, incharge_lecturer_id } = body // ✅ ADDED

    if (!name || !department_id) {
      return NextResponse.json({ error: 'Name and department are required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('classes')
      .insert({
        name,
        department_id,
        default_strength,
        is_active: true,
        incharge_lecturer_id: incharge_lecturer_id ?? null, // ✅ ADDED
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
