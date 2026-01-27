import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentsList } from './students-list'
import { AddStudentDialog } from './add-student-dialog'
import { StudentsSearch } from './students-search'

async function getStudentsWithClasses(searchQuery?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('students')
    .select(`
      *,
      classes (
        id,
        name,
        department_id,
        departments (
          id,
          name
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (searchQuery) {
    query = query.or(
      `name.ilike.%${searchQuery}%,admission_number.ilike.%${searchQuery}%,nic.ilike.%${searchQuery}%`
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

  const students = await getStudentsWithClasses(searchQuery)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 mt-1">Manage enrolled students</p>
        </div>
        <AddStudentDialog />
      </div>

      <StudentsSearch initialSearch={searchQuery} />

      <Card>
        <CardHeader>
          <CardTitle>
            {searchQuery 
              ? `Search Results (${students.length})` 
              : `All Students (${students.length})`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StudentsList students={students as any} />
        </CardContent>
      </Card>
    </div>
  )
}
