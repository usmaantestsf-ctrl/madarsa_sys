// app/api/students/bulk-upload/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ 
        error: 'CSV file is empty or contains only headers. Please add student data rows.' 
      }, { status: 400 })
    }

    const headerLine = lines[0]
    const delimiter = detectDelimiter(headerLine)
    const headers = parseCSVLine(headerLine, delimiter)
    
    console.log('Detected delimiter:', delimiter === '\t' ? 'TAB' : 'COMMA')
    console.log('Found headers:', headers)
    console.log('Total columns:', headers.length)

    const headerMap: { [key: string]: string } = {
      // Human-readable headers (tab-delimited export format)
      'Admision No':                          'admission_number',
      'Name with initial':                    'name_with_initial',
      'Full Name':                            'full_name',
      'Date of Birth':                        'date_of_birth',
      'Age':                                  'age',
      'N.I.C Number':                         'nic_number',
      'Date of Admision':                     'date_of_admission',
      "Father 's Status Alive / Deceased":    'father_status',
      'Father':                               'father_name',
      'Grade in madrasa':                     'madrasa_grade',
      'Class Usthadh':                        'usthadh_name',
      'Class Usthadh Contact Number':         'usthadh_contact_number',
      'Grade in School':                      'school_grade',
      'Section':                              'department',   // ✅ was 'section' → now maps to 'department'
      'Distric':                              'district',
      'Address':                              'address',
      'Contact':                              'contact_number',
      // Snake_case headers (CSV template format)
      'admission_number':                     'admission_number',
      'name_with_initial':                    'name_with_initial',
      'full_name':                            'full_name',
      'date_of_birth':                        'date_of_birth',
      'age':                                  'age',
      'nic_number':                           'nic_number',
      'date_of_admission':                    'date_of_admission',
      'father_status':                        'father_status',
      'father_name':                          'father_name',
      'madrasa_grade':                        'madrasa_grade',
      'usthadh_name':                         'usthadh_name',
      'usthadh_contact_number':               'usthadh_contact_number',
      'school_grade':                         'school_grade',
      'section':                              'department',   // ✅ legacy CSV column → maps to 'department'
      'department':                           'department',   // ✅ new CSV column
      'department_id':                        'department_id',// ✅ added
      'district':                             'district',
      'address':                              'address',
      'contact_number':                       'contact_number',
    }

    const columnIndexMap: { [key: number]: string } = {}
    headers.forEach((header, index) => {
      const dbColumn = headerMap[header]
      if (dbColumn) {
        columnIndexMap[index] = dbColumn
      }
    })

    console.log('Column mapping:', columnIndexMap)

    const supabase = await createClient()
    let failed = 0
    const detailedErrors: string[] = []
    const recordsToInsert: any[] = []

    for (let i = 1; i < lines.length; i++) {
      const rowNumber = i + 1
      try {
        const values = parseCSVLine(lines[i], delimiter)

        const rowData: any = {}
        values.forEach((value, index) => {
          const dbColumn = columnIndexMap[index]
          if (dbColumn) {
            const trimmedValue = value?.trim()
            rowData[dbColumn] = trimmedValue && trimmedValue !== '' ? trimmedValue : null
          }
        })

        if (i <= 3) {
          console.log(`Row ${rowNumber} data:`, {
            admission_number: rowData.admission_number,
            name: rowData.name_with_initial,
            father: rowData.father_name,
            father_status: rowData.father_status,
            grade: rowData.madrasa_grade,
            department: rowData.department,
          })
        }

        // Validate required fields
        const missingFields: string[] = []
        if (!rowData.admission_number)  missingFields.push('Admission Number')
        if (!rowData.name_with_initial) missingFields.push('Name with Initial')
        if (!rowData.full_name)         missingFields.push('Full Name')
        if (!rowData.madrasa_grade)     missingFields.push('Grade in Madrasa')

        if (missingFields.length > 0) {
          detailedErrors.push(`Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')}`)
          failed++
          continue
        }

        // Validate and convert dates
        const dateFields = [
          { field: 'date_of_birth',      name: 'Date of Birth',      required: false },
          { field: 'date_of_admission',  name: 'Date of Admission',  required: false },
        ]
        
        let dateError = false
        for (const { field, name, required } of dateFields) {
          if (rowData[field]) {
            const convertedDate = convertToISODate(rowData[field])
            if (!convertedDate) {
              detailedErrors.push(`Row ${rowNumber} (${rowData.name_with_initial}): Invalid ${name} format: "${rowData[field]}". Expected YYYY-MM-DD`)
              dateError = true
              failed++
              break
            }
            rowData[field] = convertedDate
          } else if (required) {
            detailedErrors.push(`Row ${rowNumber} (${rowData.name_with_initial}): Missing required field: ${name}`)
            dateError = true
            failed++
            break
          }
        }
        
        if (dateError) continue

        // Normalize father_status
        if (rowData.father_status) {
          const statusUpper = rowData.father_status.trim().toUpperCase()
          if (statusUpper === 'YES' || statusUpper.includes('ALIVE')) {
            rowData.father_status = 'Alive'
          } else if (statusUpper === 'NO' || statusUpper.includes('DEATH') || statusUpper.includes('DECEASED')) {
            rowData.father_status = 'Deceased'
          } else {
            rowData.father_status = 'Alive'
          }
        }

        recordsToInsert.push({
          admission_number:       rowData.admission_number,
          name_with_initial:      rowData.name_with_initial,
          full_name:              rowData.full_name,
          date_of_birth:          rowData.date_of_birth         || null,
          nic_number:             rowData.nic_number             || null,
          date_of_admission:      rowData.date_of_admission      || null,
          father_name:            rowData.father_name            || null,
          father_status:          rowData.father_status          || null,
          department_id:          rowData.department_id          || null,  // ✅ UUID FK
          department:             rowData.department             || null,  // ✅ text column
          madrasa_grade:          rowData.madrasa_grade,                   // ✅ required
          usthadh_name:           rowData.usthadh_name           || null,
          usthadh_contact_number: rowData.usthadh_contact_number || null,
          school_grade:           rowData.school_grade           || null,
          // section: ❌ removed entirely
          district:               rowData.district               || null,
          address:                rowData.address                || null,
          contact_number:         rowData.contact_number         || null,
          is_active: true,
        })

      } catch (error: any) {
        detailedErrors.push(`Row ${rowNumber}: ${error.message || 'Unknown error'}`)
        failed++
      }
    }

    if (failed > 0) {
      return NextResponse.json({
        successful: 0,
        failed,
        total: failed,
        errors: detailedErrors.slice(0, 20),
        summary: detailedErrors.length > 20 ? `Showing first 20 of ${detailedErrors.length} errors` : '',
        message: `❌ Import failed. ${failed} row(s) had validation errors. No records were inserted.`
      }, { status: 400 })
    }

    if (recordsToInsert.length > 0) {
      const { data, error } = await supabase
        .from('students')
        .insert(recordsToInsert)

      if (error) {
        let errorMsg = error.message
        if (error.code === '23505') {
          const dupMatch = error.message.match(/\(admission_number\)=\(([^)]+)\)/)
          errorMsg = `Duplicate admission number: "${dupMatch ? dupMatch[1] : 'unknown'}" already exists`
        } else if (error.message.includes('foreign key')) {
          errorMsg = 'Invalid department_id: one or more department UUIDs do not exist'
        } else if (error.message.includes('invalid input syntax for type date')) {
          errorMsg = 'Invalid date format in one of the date fields'
        }

        return NextResponse.json({
          successful: 0,
          failed: recordsToInsert.length,
          total: recordsToInsert.length,
          errors: [errorMsg],
          message: `❌ Database insertion failed: ${errorMsg}. No records were inserted.`
        }, { status: 400 })
      }

      return NextResponse.json({
        successful: recordsToInsert.length,
        failed: 0,
        total: recordsToInsert.length,
        errors: [],
        message: `✓ Successfully imported all ${recordsToInsert.length} student(s).`
      })
    }

    return NextResponse.json({
      successful: 0, failed: 0, total: 0, errors: [],
      message: 'No valid records found to import.'
    }, { status: 400 })

  } catch (error: any) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process file', details: error.message },
      { status: 500 }
    )
  }
}

function detectDelimiter(line: string): string {
  const tabCount = (line.match(/\t/g) || []).length
  return tabCount > 0 ? '\t' : ','
}

function parseCSVLine(line: string, delimiter: string): string[] {
  if (delimiter === '\t') {
    return line.split('\t').map(v => v.trim())
  }
  const values: string[] = []
  let currentValue = ''
  let insideQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentValue += '"'
        i++
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (char === delimiter && !insideQuotes) {
      values.push(currentValue.trim())
      currentValue = ''
    } else {
      currentValue += char
    }
  }
  values.push(currentValue.trim())
  return values
}

function convertToISODate(dateString: string): string | null {
  if (!dateString || dateString.trim() === '') return null
  let trimmed = dateString.trim().replace(/\s+\d{1,2}:\d{2}(:\d{2})?.*$/, '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(trimmed)
    return !isNaN(date.getTime()) ? trimmed : null
  }
  const slashMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/)
  if (slashMatch) {
    const part1 = parseInt(slashMatch[1])
    const part2 = parseInt(slashMatch[2])
    const year = slashMatch[3]
    let month: string, day: string
    if (part1 > 12) {
      day = part1.toString().padStart(2, '0')
      month = part2.toString().padStart(2, '0')
    } else {
      month = part1.toString().padStart(2, '0')
      day = part2.toString().padStart(2, '0')
    }
    const isoDate = `${year}-${month}-${day}`
    const date = new Date(isoDate)
    return !isNaN(date.getTime()) ? isoDate : null
  }
  return null
}
