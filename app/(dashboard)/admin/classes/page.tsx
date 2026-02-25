import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClassesList } from './classes-list'
import { AddClassDialog } from './add-class-dialog'
import { ClassesSearch } from './classes-search'

async function getClassesWithDepartments(searchQuery?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('classes')
    .select(`
      *,
      departments (
        id,
        name,
        type
      ),
      student_enrollments (
        count
      )
    `)
    .eq('student_enrollments.is_current', true)   // ✅ only count active enrollments
    .order('created_at', { ascending: false })

  if (searchQuery) {
    query = query.ilike('name', `%${searchQuery}%`)
  }

  const { data: classes, error } = await query

  if (error) {
    console.error('Error fetching classes:', error)
    return []
  }

  return classes || []
}

async function getDepartments() {
  const supabase = await createClient()
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name, type')
    .eq('is_active', true)
    .order('name')

  return departments || []
}

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const searchQuery = params.search

  const [classes, departments] = await Promise.all([
    getClassesWithDepartments(searchQuery),
    getDepartments()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-500 mt-1">Manage madrasa classes and student groups</p>
        </div>
        <AddClassDialog departments={departments} />
      </div>

      <ClassesSearch initialSearch={searchQuery} />

      <Card>
        <CardHeader>
          <CardTitle>
            {searchQuery 
              ? `Search Results (${classes.length})` 
              : `All Classes (${classes.length})`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClassesList classes={classes} departments={departments} />
        </CardContent>
      </Card>
    </div>
  )
}
