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

    // Parse header line and detect delimiter
    const headerLine = lines[0]
    const delimiter = detectDelimiter(headerLine)
    const headers = parseCSVLine(headerLine, delimiter)
    
    console.log('Detected delimiter:', delimiter === '\t' ? 'TAB' : 'COMMA')
    console.log('Found headers:', headers)
    console.log('Total columns:', headers.length)

    // Comprehensive header mapping - supports multiple formats
    const headerMap: { [key: string]: string } = {
      // Original expected format (tab-delimited)
      'Admision No': 'admission_number',
      'Name with initial': 'name_with_initial',
      'Full Name': 'full_name',
      'Date of Birth': 'date_of_birth',
      'Age': 'age',
      'N.I.C Number': 'nic_number',
      'Date of Admision': 'date_of_admission',
      "Father 's Status Alive / Deceased": 'father_status',
      'Father': 'father_name',
      'Grade in madrasa': 'madrasa_grade',
      'Class Usthadh': 'usthadh_name',
      'Class Usthadh Contact Number': 'usthadh_contact_number',
      'Grade in School': 'school_grade',
      'Section': 'section',
      'Distric': 'district',
      'Address': 'address',
      'Contact': 'contact_number',
      // Snake_case format (direct database column names)
      'admission_number': 'admission_number',
      'name_with_initial': 'name_with_initial',
      'full_name': 'full_name',
      'date_of_birth': 'date_of_birth',
      'age': 'age',
      'nic_number': 'nic_number',
      'date_of_admission': 'date_of_admission',
      'father_status': 'father_status',
      'father_name': 'father_name',
      'madrasa_grade': 'madrasa_grade',
      'usthadh_name': 'usthadh_name',
      'usthadh_contact_number': 'usthadh_contact_number',
      'school_grade': 'school_grade',
      'section': 'section',
      'district': 'district',
      'address': 'address',
      'contact_number': 'contact_number'
    }

    // Create index mapping from CSV headers to database columns
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

    // First pass: Parse and validate all rows (don't insert yet)
    for (let i = 1; i < lines.length; i++) {
      const rowNumber = i + 1
      try {
        // Parse the line using the detected delimiter
        const values = parseCSVLine(lines[i], delimiter)

        // Map values to database columns using the index map
        const rowData: any = {}
        values.forEach((value, index) => {
          const dbColumn = columnIndexMap[index]
          if (dbColumn) {
            const trimmedValue = value?.trim()
            rowData[dbColumn] = trimmedValue && trimmedValue !== '' ? trimmedValue : null
          }
        })

        // Debug: log the first few rows
        if (i <= 3) {
          console.log(`Row ${rowNumber} data:`, {
            admission_number: rowData.admission_number,
            name: rowData.name_with_initial,
            father: rowData.father_name,
            father_status: rowData.father_status,
            grade: rowData.madrasa_grade
          })
        }

        // Validate required fields (based on updated nullable schema)
        const missingFields: string[] = []
        if (!rowData.admission_number) missingFields.push('Admission Number')
        if (!rowData.name_with_initial) missingFields.push('Name with Initial')
        if (!rowData.full_name) missingFields.push('Full Name')
        if (!rowData.madrasa_grade) missingFields.push('Grade in Madrasa')
        // date_of_birth, father_name, and date_of_admission are nullable

        if (missingFields.length > 0) {
          const errorMsg = `Missing required fields: ${missingFields.join(', ')}`
          detailedErrors.push(`Row ${rowNumber}: ${errorMsg}`)
          failed++
          continue
        }

        // Validate and convert date formats
        const dateFields = [
          { field: 'date_of_birth', name: 'Date of Birth', required: false },
          { field: 'date_of_admission', name: 'Date of Admission', required: false }
        ]
        
        let dateError = false
        for (const { field, name, required } of dateFields) {
          if (rowData[field]) {
            const convertedDate = convertToISODate(rowData[field])
            if (!convertedDate) {
              const errorMsg = `Invalid ${name} format: "${rowData[field]}". Expected YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY`
              detailedErrors.push(`Row ${rowNumber} (${rowData.name_with_initial}): ${errorMsg}`)
              dateError = true
              failed++
              break
            }
            rowData[field] = convertedDate
            
            // Log successful date conversion for first few rows
            if (i <= 3) {
              console.log(`Row ${rowNumber}: Converted ${name} from "${rowData[field]}" to ISO: ${convertedDate}`)
            }
          } else if (required) {
            const errorMsg = `Missing required field: ${name}`
            detailedErrors.push(`Row ${rowNumber} (${rowData.name_with_initial}): ${errorMsg}`)
            dateError = true
            failed++
            break
          }
        }
        
        if (dateError) continue

        // Normalize father_status to match database constraint
        // This handles values like "NO - Death" -> "NO"
        // Once you drop the constraint, you can remove this normalization
        if (rowData.father_status) {
          const status = rowData.father_status.trim()
          const statusUpper = status.toUpperCase()
          
          // Map variations to valid constraint values: YES, NO, Yes, No
          if (statusUpper === 'YES' || statusUpper.includes('ALIVE')) {
            rowData.father_status = 'YES'
          } else if (statusUpper === 'NO' || statusUpper.includes('DEATH') || statusUpper.includes('DECEASED')) {
            rowData.father_status = 'NO'
          } else if (statusUpper === 'YES' || status === 'Yes') {
            rowData.father_status = 'Yes'
          } else if (statusUpper === 'NO' || status === 'No') {
            rowData.father_status = 'No'
          } else {
            // If it doesn't match, default to 'NO' to avoid constraint violation
            rowData.father_status = 'NO'
          }
        }

        // Add to batch for insertion (don't insert yet)
        recordsToInsert.push({
          admission_number: rowData.admission_number,
          name_with_initial: rowData.name_with_initial,
          full_name: rowData.full_name,
          date_of_birth: rowData.date_of_birth,
          nic_number: rowData.nic_number,
          date_of_admission: rowData.date_of_admission,
          father_name: rowData.father_name,
          father_status: rowData.father_status,
          madrasa_grade: rowData.madrasa_grade,
          usthadh_name: rowData.usthadh_name,
          usthadh_contact_number: rowData.usthadh_contact_number,
          school_grade: rowData.school_grade,
          section: rowData.section,
          district: rowData.district,
          address: rowData.address,
          contact_number: rowData.contact_number,
          is_active: true
        })

      } catch (error: any) {
        const errorMsg = error.message || 'Unknown error occurred'
        detailedErrors.push(`Row ${rowNumber}: ${errorMsg}`)
        failed++
      }
    }

    // If there were any validation errors, don't proceed with insertion
    if (failed > 0) {
      return NextResponse.json({
        successful: 0,
        failed,
        total: failed,
        errors: detailedErrors.slice(0, 20),
        summary: detailedErrors.length > 20 ? `Showing first 20 of ${detailedErrors.length} errors` : '',
        message: `❌ Import failed. ${failed} row(s) had validation errors. Please fix the errors and try again. No records were inserted.`
      }, { status: 400 })
    }

    // All rows validated successfully - now insert them all at once
    if (recordsToInsert.length > 0) {
      const { data, error } = await supabase
        .from('students')
        .insert(recordsToInsert)

      if (error) {
        let errorMsg = error.message
        
        if (error.code === '23505') {
          // Find which admission number is duplicate
          const dupMatch = error.message.match(/\(admission_number\)=\(([^)]+)\)/)
          const dupNumber = dupMatch ? dupMatch[1] : 'unknown'
          errorMsg = `Duplicate admission number: "${dupNumber}" already exists in the database`
        } else if (error.message.includes('foreign key')) {
          errorMsg = `Invalid class name: One or more classes do not exist. Please create the classes first.`
        } else if (error.message.includes('invalid input syntax for type date')) {
          errorMsg = `Invalid date format in one of the date fields`
        }
        
        return NextResponse.json({
          successful: 0,
          failed: recordsToInsert.length,
          total: recordsToInsert.length,
          errors: [errorMsg],
          message: `❌ Database insertion failed: ${errorMsg}. No records were inserted.`
        }, { status: 400 })
      }

      const successful = recordsToInsert.length
      return NextResponse.json({
        successful,
        failed: 0,
        total: successful,
        errors: [],
        message: `✓ Successfully imported all ${successful} student(s).`
      }, { status: 200 })
    }

    // No records to insert
    return NextResponse.json({
      successful: 0,
      failed: 0,
      total: 0,
      errors: [],
      message: 'No valid records found to import.'
    }, { status: 400 })

  } catch (error: any) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process file',
        details: error.message || 'An unexpected error occurred. Please check your file format.'
      },
      { status: 500 }
    )
  }
}

// Helper function to detect delimiter (tab or comma)
function detectDelimiter(line: string): string {
  // Count tabs vs commas
  const tabCount = (line.match(/\t/g) || []).length
  const commaCount = (line.match(/,/g) || []).length
  
  // If we have tabs, assume tab-delimited
  if (tabCount > 0) {
    return '\t'
  }
  
  // Otherwise, assume comma-delimited
  return ','
}

// Helper function to parse CSV line with proper quote handling
function parseCSVLine(line: string, delimiter: string): string[] {
  if (delimiter === '\t') {
    // Simple tab splitting (tabs don't usually appear in quoted fields)
    return line.split('\t').map(v => v.trim())
  }
  
  // CSV parsing with quote handling
  const values: string[] = []
  let currentValue = ''
  let insideQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentValue += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes
      }
    } else if (char === delimiter && !insideQuotes) {
      // End of field
      values.push(currentValue.trim())
      currentValue = ''
    } else {
      currentValue += char
    }
  }
  
  // Add the last value
  values.push(currentValue.trim())
  
  return values
}

// Helper function to convert various date formats to ISO (YYYY-MM-DD)
function convertToISODate(dateString: string): string | null {
  if (!dateString || dateString.trim() === '') return null
  
  let trimmed = dateString.trim()
  
  // Remove time component if present (e.g., "1/12/2022 0:00" -> "1/12/2022")
  trimmed = trimmed.replace(/\s+\d{1,2}:\d{2}(:\d{2})?.*$/, '').trim()
  
  // Already in ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(trimmed)
    if (date instanceof Date && !isNaN(date.getTime())) {
      return trimmed
    }
  }
  
  // Try parsing M/D/YYYY or MM/DD/YYYY format (US format - most common in your data)
  const slashMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/)
  if (slashMatch) {
    const part1 = parseInt(slashMatch[1])
    const part2 = parseInt(slashMatch[2])
    const year = slashMatch[3]
    
    // Determine if it's MM/DD/YYYY or DD/MM/YYYY
    // If first part > 12, it must be DD/MM/YYYY
    // If second part > 12, it must be MM/DD/YYYY
    // Otherwise, assume MM/DD/YYYY (US format) since your data uses 12/15/2000, 3/1/2002, etc.
    let month: string
    let day: string
    
    if (part1 > 12) {
      // Must be DD/MM/YYYY
      day = part1.toString().padStart(2, '0')
      month = part2.toString().padStart(2, '0')
    } else if (part2 > 12) {
      // Must be MM/DD/YYYY
      month = part1.toString().padStart(2, '0')
      day = part2.toString().padStart(2, '0')
    } else {
      // Ambiguous - assume MM/DD/YYYY (US format)
      month = part1.toString().padStart(2, '0')
      day = part2.toString().padStart(2, '0')
    }
    
    const isoDate = `${year}-${month}-${day}`
    const date = new Date(isoDate)
    
    // Validate the date is real
    if (date instanceof Date && !isNaN(date.getTime())) {
      return isoDate
    }
  }
  
  return null
}