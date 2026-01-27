import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AttendanceSelector } from './attendance-selector-lecturer'
import { AttendanceMarker } from '../../admin/attendance/attendance-marker'

async function getLecturerInfo(userId: string) {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('users')
    .select('lecturer_id')
    .eq('id', userId)
    .single()

  if (!profile?.lecturer_id) return null

  const { data: lecturer } = await supabase
    .from('lecturers')
    .select('*')
    .eq('id', profile.lecturer_id)
    .single()

  return lecturer
}

async function getTodayLecturerTimetable(lecturerId: string) {
  const supabase = await createClient()
  const today = new Date().getDay()

  const { data } = await supabase
    .from('timetable')
    .select(`
      id,
      time_slots (id, slot_number, start_time, end_time),
      subjects (id, name),
      classes (id, name)
    `)
    .eq('lecturer_id', lecturerId)
    .eq('day_of_week', today)
    .eq('is_active', true)
    .is('valid_to', null)
    .order('time_slots(slot_number)')

  return data || []
}

async function getStudents(timetableId?: string) {
  if (!timetableId) return []

  const supabase = await createClient()
  
  // Get class_id from timetable
  const { data: timetableEntry } = await supabase
    .from('timetable')
    .select('class_id')
    .eq('id', timetableId)
    .single()

  if (!timetableEntry) return []

  const { data } = await supabase
    .from('students')
    .select('id, name, admission_number')
    .eq('class_id', timetableEntry.class_id)
    .eq('is_active', true)
    .order('admission_number')

  return data || []
}

export default async function LecturerAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string }>
}) {
  const session = await getSession()
  
  if (!session || session.role !== 'lecturer') {
    redirect('/login')
  }

  const lecturer = await getLecturerInfo(session.userId)
  
  if (!lecturer) {
    return <div className="text-center py-12 text-red-600">No lecturer profile found</div>
  }

  const params = await searchParams
  const selectedLesson = params.lesson

  const [timetable, students] = await Promise.all([
    getTodayLecturerTimetable(lecturer.id),
    getStudents(selectedLesson),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500 mt-1">Mark attendance for your classes today</p>
      </div>

      <AttendanceSelector
        timetable={timetable as any}
        selectedLesson={selectedLesson}
      />

      {selectedLesson && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceMarker
              students={students as any}
              timetableId={selectedLesson}
            />
          </CardContent>
        </Card>
      )}

      {!selectedLesson && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">
              Select a lesson to mark attendance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
