import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LecturersList } from './lecturers-list'
import { AddLecturerDialog } from './add-lecturer-dialog'
import { LecturersSearch } from './lecturers-search'

async function getLecturers(searchQuery?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('lecturers')
    .select('*')
    .order('created_at', { ascending: false })

  // Apply search filters if query exists
  if (searchQuery) {
    query = query.or(
      `name.ilike.%${searchQuery}%,nic.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
    )
  }

  const { data: lecturers, error } = await query

  if (error) {
    console.error('Error fetching lecturers:', error)
    return []
  }

  return lecturers || []
}

export default async function LecturersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const searchQuery = params.search

  const lecturers = await getLecturers(searchQuery)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lecturers</h1>
          <p className="text-gray-500 mt-1">Manage madrasa teaching staff</p>
        </div>
        <AddLecturerDialog />
      </div>

      <LecturersSearch initialSearch={searchQuery} />

      <Card>
        <CardHeader>
          <CardTitle>
            {searchQuery 
              ? `Search Results (${lecturers.length})` 
              : `All Lecturers (${lecturers.length})`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LecturersList lecturers={lecturers} />
        </CardContent>
      </Card>
    </div>
  )
}
