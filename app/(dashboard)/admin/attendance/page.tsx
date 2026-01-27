import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AttendanceSelector } from './attendance-selector'
import { AttendanceList } from './attendance-list'

async function getDepartments() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('departments')
    .select('id, name, type')
    .eq('is_active', true)
    .order('name')

  return data || []
}

async function getClasses() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('classes')
    .select('id, name, department_id')
    .eq('is_active', true)
    .order('name')

  return data || []
}

async function getAttendanceRecords(
  departmentId?: string,
  classId?: string,
  date?: string
) {
  if (!classId || !date) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('attendance')
    .select(`
      *,
      students (
        id,
        name,
        admission_number
      ),
      lecturers (
        name
      )
    `)
    .eq('class_id', classId)
    .eq('date', date)
    .order('created_at', { ascending: false })

  return data || []
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; class?: string; date?: string }>
}) {
  const params = await searchParams
  const selectedDepartment = params.department
  const selectedClass = params.class
  const selectedDate = params.date || new Date().toISOString().split('T')[0]

  const [departments, classes, attendance] = await Promise.all([
    getDepartments(),
    getClasses(),
    getAttendanceRecords(selectedDepartment, selectedClass, selectedDate),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-500 mt-1">View and manage student attendance records</p>
      </div>

      <AttendanceSelector
        departments={departments}
        classes={classes}
        selectedDepartment={selectedDepartment}
        selectedClass={selectedClass}
        selectedDate={selectedDate}
      />

      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records ({attendance.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceList attendance={attendance as any} />
          </CardContent>
        </Card>
      )}

      {!selectedClass && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              Please select a department, class, and date to view attendance records
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
