import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AttendanceSelector } from './attendance-selector'
import { AttendanceList } from './attendance-list'
import { AttendanceSlotAccordion } from './attendance-slot-accordion'

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

async function getAttendanceRecords(classId?: string, date?: string) {
  if (!classId || !date) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('attendance')
    .select(`
      *,
      students ( id, full_name, admission_number ),
      lecturers ( name )
    `)
    .eq('class_id', classId)
    .eq('date', date)
    .order('created_at', { ascending: false })
  return data || []
}

async function getTimetableForDay(classId?: string, date?: string) {
  if (!classId || !date) return []

  const d = new Date(date)
  const jsDay = d.getDay()
  const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('timetable')
    .select(`
      id,
      day_of_week,
      subjects ( id, name ),
      lecturer:lecturer_id ( lecturer_id, full_name ),
      time_slots ( id, slot_number, start_time, end_time )
    `)
    .eq('class_id', classId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)
    .order('day_of_week')

  if (error) console.error('Timetable fetch error:', error.message)

  // Deduplicate by id
  const seen = new Set()
  return (data || []).filter((entry) => {
    if (seen.has(entry.id)) return false
    seen.add(entry.id)
    return true
  })
}

async function getEnrolledStudents(classId?: string) {
  if (!classId) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('student_enrollments')
    .select('students ( id, full_name, admission_number )')
    .eq('class_id', classId)
    .eq('is_current', true)
    .eq('status', 'active')

  if (error) console.error('Students fetch error:', error.message)

  // Deduplicate students by id
  const seen = new Set()
  return (data || [])
    .map((e: any) => e.students)
    .filter(Boolean)
    .filter((s: any) => {
      if (seen.has(s.id)) return false
      seen.add(s.id)
      return true
    })
}

function formatTime(time?: string) {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
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

  const [departments, classes, attendance, timetableEntries, students] = await Promise.all([
    getDepartments(),
    getClasses(),
    getAttendanceRecords(selectedClass, selectedDate),
    getTimetableForDay(selectedClass, selectedDate),
    getEnrolledStudents(selectedClass),
  ])

  const hasAttendance = attendance.length > 0
  const hasTimetable = timetableEntries.length > 0

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

      {!selectedClass && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              Please select a department, class, and date to view attendance records
            </p>
          </CardContent>
        </Card>
      )}

      {/* Existing attendance records — read only */}
      {selectedClass && hasAttendance && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records ({attendance.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceList attendance={attendance as any} />
          </CardContent>
        </Card>
      )}

      {/* Mark attendance — slot accordion */}
      {selectedClass && !hasAttendance && hasTimetable && students.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Mark Attendance —{' '}
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h2>
          <p className="text-sm text-gray-500">
            {timetableEntries.length} slot{timetableEntries.length !== 1 ? 's' : ''} · {students.length} student{students.length !== 1 ? 's' : ''}. Click a slot to expand and mark attendance.
          </p>
          <AttendanceSlotAccordion
            timetableEntries={timetableEntries as any}
            students={students}
            date={selectedDate}
          />
        </div>
      )}

      {/* No timetable for this day */}
      {selectedClass && !hasAttendance && !hasTimetable && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              No timetable entries found for this class on this day.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Make sure the timetable is set up for this class and day of week.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No students enrolled */}
      {selectedClass && !hasAttendance && hasTimetable && students.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No active students enrolled in this class.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}