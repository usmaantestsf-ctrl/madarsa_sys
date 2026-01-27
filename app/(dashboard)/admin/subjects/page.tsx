import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SubjectsList } from './subjects-list'
import { AddSubjectDialog } from './add-subject-dialog'
import { SubjectsSearch } from './subjects-search'

async function getSubjects(searchQuery?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('subjects')
    .select('*')
    .order('created_at', { ascending: false })

  if (searchQuery) {
    query = query.ilike('name', `%${searchQuery}%`)
  }

  const { data: subjects, error } = await query

  if (error) {
    console.error('Error fetching subjects:', error)
    return []
  }

  return subjects || []
}

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const searchQuery = params.search

  const subjects = await getSubjects(searchQuery)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-500 mt-1">Manage madrasa subjects and lessons</p>
        </div>
        <AddSubjectDialog />
      </div>

      <SubjectsSearch initialSearch={searchQuery} />

      <Card>
        <CardHeader>
          <CardTitle>
            {searchQuery 
              ? `Search Results (${subjects.length})` 
              : `All Subjects (${subjects.length})`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SubjectsList subjects={subjects} />
        </CardContent>
      </Card>
    </div>
  )
}
