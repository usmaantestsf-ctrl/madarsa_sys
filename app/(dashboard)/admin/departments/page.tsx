import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
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

export default async function DepartmentsPage() {
  const departments = await getDepartments()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1">Manage your madrasa departments</p>
        </div>
        <AddDepartmentDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentsList departments={departments} />
        </CardContent>
      </Card>
    </div>
  )
}
