import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type CSVRow = {
  name: string
  admission_number: string
  nic?: string
  phone?: string
  address?: string
  class_name: string
  guardian_name: string
  guardian_phone: string
  guardian_nic?: string
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read CSV file
    const text = await file.text()
    const rows = text.split('\n').filter(row => row.trim())

    if (rows.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 })
    }

    // Parse CSV
    const headers = rows[0].split(',').map(h => h.trim())
    const dataRows = rows.slice(1)

    const supabase = await createClient()

    // Get all classes for lookup
    const { data: classes } = await supabase
      .from('classes')
      .select('id, name')

    if (!classes) {
      return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
    }

    const classMap = new Map(classes.map(c => [c.name.toLowerCase(), c.id]))

    let successCount = 0
    let failedCount = 0
    const errors: Array<{ row: number; error: string; data: any }> = []

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const rowNumber = i + 2 // +2 because: +1 for header, +1 for 1-based index
      const values = dataRows[i].split(',').map(v => v.trim())

      if (values.length < headers.length || values.every(v => !v)) {
        continue // Skip empty rows
      }

      // Parse row data
      const rowData: any = {}
      headers.forEach((header, idx) => {
        rowData[header] = values[idx] || ''
      })

      try {
        // Validate required fields
        if (!rowData.name || !rowData.admission_number || !rowData.class_name || !rowData.guardian_name || !rowData.guardian_phone) {
          throw new Error('Missing required fields (name, admission_number, class_name, guardian_name, guardian_phone)')
        }

        // Find class ID
        const classId = classMap.get(rowData.class_name.toLowerCase())
        if (!classId) {
          throw new Error(`Class "${rowData.class_name}" not found`)
        }

        // Check if admission number already exists
        const { data: existing } = await supabase
          .from('students')
          .select('id')
          .eq('admission_number', rowData.admission_number)
          .single()

        if (existing) {
          throw new Error(`Admission number ${rowData.admission_number} already exists`)
        }

        // Insert student
        const { error } = await supabase
          .from('students')
          .insert({
            name: rowData.name,
            admission_number: rowData.admission_number,
            nic: rowData.nic || null,
            phone: rowData.phone || null,
            address: rowData.address || null,
            class_id: classId,
            guardian_name: rowData.guardian_name,
            guardian_phone: rowData.guardian_phone,
            guardian_nic: rowData.guardian_nic || null,
            is_active: true,
          })

        if (error) throw error

        successCount++
      } catch (error: any) {
        failedCount++
        errors.push({
          row: rowNumber,
          error: error.message || 'Unknown error',
          data: rowData,
        })
      }
    }

    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      errors,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
