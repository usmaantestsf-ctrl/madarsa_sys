import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentsList } from './students-list'
import { AddStudentDialog } from './add-student-dialog'
import { StudentsSearch } from './students-search'

async function getStudents(searchQuery?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('students')
    .select(`
      *,
      departments (
        name,
        type
      )
    `)
    .order('created_at', { ascending: false })

  if (searchQuery) {
    query = query.or(
      `name_with_initial.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,admission_number.ilike.%${searchQuery}%,nic_number.ilike.%${searchQuery}%,father_name.ilike.%${searchQuery}%,district.ilike.%${searchQuery}%,madrasa_grade.ilike.%${searchQuery}%`
    )
  }

  const { data: students, error } = await query

  if (error) {
    console.error('Error fetching students:', error)
    return []
  }

  return students || []
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const searchQuery = params.search
  const students = await getStudents(searchQuery)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Students Management</CardTitle>
          <p className="text-sm text-gray-500">
            Manage enrolled students
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 mb-6">
            <StudentsSearch initialSearch={searchQuery} />
            <AddStudentDialog />
          </div>
          <StudentsList students={students} />
        </CardContent>
      </Card>
    </div>
  )
}