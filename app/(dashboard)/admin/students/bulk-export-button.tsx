'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function BulkExportButton() {
  const handleExport = async () => {
    const supabase = createClient()

    const { data: students } = await supabase
      .from('students')
      .select(`
        name,
        admission_number,
        nic,
        phone,
        address,
        classes (name),
        guardian_name,
        guardian_phone,
        guardian_nic
      `)
      .order('admission_number')

    if (!students || students.length === 0) {
      alert('No students to export')
      return
    }

    // Create CSV
    const headers = 'name,admission_number,nic,phone,address,class_name,guardian_name,guardian_phone,guardian_nic\n'
    const rows = students.map((s: any) => {
      return [
        s.name,
        s.admission_number,
        s.nic || '',
        s.phone || '',
        s.address || '',
        s.classes.name,
        s.guardian_name,
        s.guardian_phone,
        s.guardian_nic || '',
      ].join(',')
    }).join('\n')

    const csvContent = headers + rows

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  )
}
