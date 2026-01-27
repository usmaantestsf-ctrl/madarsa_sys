import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, nic, phone, email, address, password, create_user_account } = body

    const supabase = await createClient()
    let userId = null

    // Step 1: Create user account FIRST if requested
    if (create_user_account && email && password) {
      // Use service role client to bypass RLS
      const supabaseAdmin = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          email,
          password, // Raw password if your trigger handles hashing
          full_name: name,
          role: 'lecturer',
          is_active: true,
        })
        .select()
        .single()

      if (userError) {
        return NextResponse.json(
          { error: `Failed to create user account: ${userError.message}` },
          { status: 400 }
        )
      }

      userId = user.id // Save the user ID
    }

    // Step 2: Create lecturer WITH user_id reference
    const { data: lecturer, error: lecturerError } = await supabase
      .from('lecturers')
      .insert({ 
        user_id: userId, // ← Link to user
        name, 
        nic, 
        phone, 
        email: email || null, 
        address: address || null,
        is_active: true 
      })
      .select()
      .single()

    if (lecturerError) {
      // Rollback: Delete the user if lecturer creation fails
      if (userId) {
        const supabaseAdmin = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )
        await supabaseAdmin.from('users').delete().eq('id', userId)
      }
      
      return NextResponse.json({ error: lecturerError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: lecturer,
      message: create_user_account 
        ? 'Lecturer and user account created successfully'
        : 'Lecturer created successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
