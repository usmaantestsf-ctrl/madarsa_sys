import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      admission_number,
      name_with_initial,
      full_name,
      date_of_birth,
      nic_number,
      date_of_admission,
      father_name,
      father_status, // ADDED
      madrasa_grade,
      usthadh_name,
      usthadh_contact_number,
      school_grade,
      section,
      district,
      address,
      contact_number
    } = body

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('students')
      .insert({ 
        admission_number,
        name_with_initial,
        full_name,
        date_of_birth,
        nic_number: nic_number || null,
        date_of_admission: date_of_admission || new Date().toISOString().split('T')[0],
        father_name,
        father_status: father_status || null, // ADDED
        madrasa_grade,
        usthadh_name: usthadh_name || null,
        usthadh_contact_number: usthadh_contact_number || null,
        school_grade: school_grade || null,
        section: section || null,
        district: district || null,
        address: address || null,
        contact_number: contact_number || null,
        is_active: true 
      })
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