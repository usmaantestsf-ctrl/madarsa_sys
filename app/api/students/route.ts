import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      name, 
      nic, 
      phone, 
      address, 
      class_id, 
      guardian_name, 
      guardian_phone, 
      guardian_nic,
      admission_number 
    } = body

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('students')
      .insert({ 
        name,
        nic: nic || null,
        phone: phone || null,
        address: address || null,
        class_id,
        guardian_name,
        guardian_phone,
        guardian_nic: guardian_nic || null,
        admission_number,
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
