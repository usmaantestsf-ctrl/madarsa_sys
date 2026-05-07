import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DepartmentsList } from './departments-list'
import { AddDepartmentDialog } from './add-department-dialog'

async function getDepartments() {
  const supabase = await createClient()
  const { data: departments, error } = await supabase
    .from('departments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching departments:', error)
    return []
  }
  return departments || []
}

// ✅ ADDED
async function getLecturers() {
  const supabase = await createClient()
  const { data: lecturers } = await supabase
    .from('lecturer')
    .select('lecturer_id, visual_name, full_name')
    .order('full_name')

  return lecturers || []
}

export default async function DepartmentsPage() {
  const [departments, lecturers] = await Promise.all([ // ✅ ADDED
    getDepartments(),
    getLecturers(), // ✅ ADDED
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1">Manage your madrasa departments</p>
        </div>
        <AddDepartmentDialog lecturers={lecturers} /> {/* ✅ ADDED prop */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments ({departments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentsList departments={departments} lecturers={lecturers} /> {/* ✅ ADDED prop */}
        </CardContent>
      </Card>
    </div>
  )
}