import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'



// ✅ ADD THIS — fetches all active departments for dropdowns
// export async function GET() {
//   try {
//     const supabase = await createClient()

//     const { data, error } = await supabase
//       .from('departments')
//       .select('id, name, type, is_active')
//       .eq('is_active', true)
//       .order('name')

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 400 })
//     }

//     return NextResponse.json(data)
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }


// api/departments/route.ts
// Add a second route or check for query param

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'  // ✅ NEW

    let query = supabase
      .from('departments')
      .select('id, name, type, is_active, created_at')
      .order('name')

    if (activeOnly) {
      query = query.eq('is_active', true)   // ✅ only filter when ?active=true
    }

    const { data, error } = await query

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


export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type } = body

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('departments')
      .insert({ name, type, is_active: true })
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


