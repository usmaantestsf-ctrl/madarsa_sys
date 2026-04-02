// app/(dashboard)/admin/students/page.tsx
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentsList } from './students-list'
import { AddStudentDialog } from './add-student-dialog'
import { StudentsSearch } from './students-search'
import { PromoteStudentsDialog } from './promote-students-dialog'
import { PassedStudentsList } from './passed-students-list'
import { StudentsFilterPanel } from './students-filter-panel'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'

async function getStudents(searchQuery?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('students')
    .select(`*, departments(name, type)`)
    .order('created_at', { ascending: false })

  if (searchQuery) {
    query = query.or(
      `name_with_initial.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,admission_number.ilike.%${searchQuery}%,nic_number.ilike.%${searchQuery}%,father_name.ilike.%${searchQuery}%,district.ilike.%${searchQuery}%,madrasa_grade.ilike.%${searchQuery}%`
    )
  }

  const { data: students, error } = await query
  if (error) { console.error('Error fetching students:', error); return [] }
  return students || []
}

async function getPassedStudents() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('passed_students')
    .select(`
      *,
      departments(name),
      classes:final_class_id(name),
      students(name_with_initial, date_of_birth, contact_number, district)
    `)
    .order('passed_out_date', { ascending: false })

  if (error) { console.error('Error fetching passed students:', error); return [] }
  return data || []
}

// async function getEnrollmentSummary() {
//   const supabase = await createClient()

//   const { data, error } = await supabase
//     .from('student_enrollments')
//     .select('academic_year')
//     .eq('is_current', true)
//     .eq('status', 'active')

//   if (error || !data) return { currentYear: '', totalActive: 0 }

//   const yearCounts: Record<string, number> = {}
//   data.forEach(e => {
//     yearCounts[e.academic_year] = (yearCounts[e.academic_year] || 0) + 1
//   })

//   const currentYear = Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
//   return { currentYear, totalActive: data.length }
// }

// app/(dashboard)/admin/students/page.tsx
async function getEnrollmentSummary() {
  const supabase = await createClient()

  // Get current academic year from enrollments
  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select('academic_year')
    .eq('is_current', true)
    .eq('status', 'active')

  const yearCounts: Record<string, number> = {}
  enrollments?.forEach(e => {
    yearCounts[e.academic_year] = (yearCounts[e.academic_year] || 0) + 1
  })
  const currentYear =
    Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || ''

  // ✅ Count directly from students table — not from enrollments
  const { count } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('is_passed', false)

  return { currentYear, totalActive: count ?? 0 }
}


async function getDepartments() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('departments')
    .select('id, name, type')
    .eq('is_active', true)
    .order('name')
  return data || []
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; view?: string }>
}) {
  const params = await searchParams
  const searchQuery = params.search
  const view = params.view || 'active'

  const [students, passedStudents, enrollmentSummary, departments] = await Promise.all([
    getStudents(searchQuery),
    getPassedStudents(),
    getEnrollmentSummary(),
    getDepartments(),
  ])

  const passedCount = passedStudents.length

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Students Management</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Manage enrolled students</p>
            </div>
            <div className="flex items-center gap-2">
              {/* {enrollmentSummary.totalActive > 0 && view === 'active' && (
                <PromoteStudentsDialog
                  currentYear={enrollmentSummary.currentYear}
                  totalActive={enrollmentSummary.totalActive}
                />
              )} */}
              {view === 'active' && (
                <PromoteStudentsDialog
                  currentYear={enrollmentSummary.currentYear}
                  totalActive={enrollmentSummary.totalActive}
                  departments={departments}
                />
              )}
              {view === 'active' ? (
                <Link href="?view=passed">
                  <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    View Passed Students ({passedCount})
                  </Button>
                </Link>
              ) : (
                <Link href="?view=active">
                  <Button variant="outline">
                    ← Back to Active Students
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'passed' ? (
            <PassedStudentsList passedStudents={passedStudents} />
          ) : (
            // ✅ Pass all students + departments to the filter panel
            // Filter panel handles KPIs, filters, search, and table
            <StudentsFilterPanel
              students={students}
              departments={departments}
              searchQuery={searchQuery}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
